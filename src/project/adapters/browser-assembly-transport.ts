/**
 * MODULE: src/project/adapters/browser-assembly-transport.ts
 * PURPOSE: Normalize native same-origin EventSource and fetch responses into validated typed assembly events.
 * PUBLIC API / ENTRYPOINTS:
 *   - BrowserAssemblyTransport: native SSE and polling implementation of AssemblyTransportPort.
 *   - BrowserAssemblyTimer: cancellable browser timer implementation for deterministic controller injection.
 *   - createBrowserLiveRoofAssemblyController: production composition root for assembly transport.
 * INVARIANTS:
 *   - [SEC-SAME-ORIGIN-ASSEMBLY] Only the two exact same-origin assembly routes may receive bounded correlation fields.
 *   - [SEC-TRANSPORT-PAYLOAD-BOUND] Stream and polling payloads are size-bounded, exact-shape validated, and project/property/cursor/provenance-schedule bound before publication.
 * BOUNDARIES:
 *   - The adapter cannot mutate project state; it publishes candidates to the application controller and retains no domain projection.
 * RELATED:
 *   - src/project/application/live-roof-assembly.ts: owns fallback budgets, retry, and transient transport state.
 *   - src/project/domain/work-events.ts: parses each untrusted event.
 *   - src/app/api/project/assembly/stream/route.ts: same-origin primary event stream.
 * SECURITY:
 *   - Requests contain no address, projection, credential, cookie payload, provider value, or external URL.
 */
import {
  DEFAULT_ASSEMBLY_POLLING_POLICY,
  LiveRoofAssemblyController,
  type AssemblyFeedCursor,
  type AssemblyPollBatch,
  type AssemblyPollingPolicy,
  type AssemblyStreamObserver,
  type AssemblyTimerPort,
  type AssemblyTransportPort,
} from "../application/live-roof-assembly";
import type { SessionProjectRuntime } from "../application/session-project-runtime";
import { assemblyEventTimestampMatches } from "../domain/assembly-event-timing";
import type { ProjectEvent } from "../domain/model";
import { parseProjectEvent } from "../domain/work-events";
import {
  DomainValidationError,
  exactKeys,
  expectRecord,
  parseSafeInteger,
} from "../domain/validation";

const STREAM_PATH = "/api/project/assembly/stream";
const POLL_PATH = "/api/project/assembly/poll";
const MAX_EVENT_BYTES = 32_000;
const MAX_POLL_BYTES = 64_000;
const POLL_RESPONSE_KEYS = [
  "schema_version",
  "fixture_version",
  "after_cursor",
  "feed_complete",
  "events",
] as const;

function queryFor(cursor: AssemblyFeedCursor): URLSearchParams {
  return new URLSearchParams({
    fixture_version: cursor.fixtureVersion,
    session_project_id: cursor.sessionProjectId,
    property_id: cursor.propertyId,
    candidate_ordinal: String(cursor.candidateOrdinal),
    confirmation_cursor: String(cursor.confirmationCursor),
    confirmation_occurred_at: cursor.confirmationOccurredAt,
    after_cursor: String(cursor.afterCursor),
    project_version: String(cursor.projectVersion),
  });
}

// @ah SEC-SAME-ORIGIN-ASSEMBLY
function sameOriginUrl(pathname: string, cursor: AssemblyFeedCursor): URL {
  const url = new URL(pathname, window.location.origin);
  if (url.origin !== window.location.origin || url.pathname !== pathname) {
    throw new Error("INVALID_ASSEMBLY_ORIGIN");
  }
  url.search = queryFor(cursor).toString();
  return url;
}

function eventMatchesCursor(
  event: ProjectEvent,
  cursor: AssemblyFeedCursor,
  expectedCursor: number,
  expectedVersion: number,
): boolean {
  return (
    event.fixture_version === cursor.fixtureVersion &&
    event.session_project_id === cursor.sessionProjectId &&
    event.property_id === cursor.propertyId &&
    event.cursor === expectedCursor &&
    event.expected_project_version === expectedVersion &&
    assemblyEventTimestampMatches({
      eventOccurredAt: event.occurred_at,
      eventCursor: event.cursor,
      confirmationOccurredAt: cursor.confirmationOccurredAt,
      confirmationCursor: cursor.confirmationCursor,
    })
  );
}

function parsePollBatch(
  value: unknown,
  cursor: AssemblyFeedCursor,
): AssemblyPollBatch {
  const record = expectRecord(value);
  exactKeys(record, POLL_RESPONSE_KEYS);
  if (
    record.schema_version !== 1 ||
    record.fixture_version !== cursor.fixtureVersion ||
    parseSafeInteger(record.after_cursor, { min: 1, max: 100 }) !==
      cursor.afterCursor ||
    typeof record.feed_complete !== "boolean" ||
    !Array.isArray(record.events) ||
    record.events.length > 7
  ) {
    throw new DomainValidationError();
  }
  const events: ProjectEvent[] = [];
  let expectedCursor = cursor.afterCursor + 1;
  let expectedVersion = cursor.projectVersion;
  for (const candidate of record.events) {
    const parsed = parseProjectEvent(candidate, cursor.fixtureVersion);
    if (
      !parsed.ok ||
      !eventMatchesCursor(parsed.event, cursor, expectedCursor, expectedVersion)
    ) {
      throw new DomainValidationError();
    }
    events.push(parsed.event);
    expectedCursor += 1;
    expectedVersion += 1;
  }
  return { events, feedComplete: record.feed_complete };
}

export class BrowserAssemblyTransport implements AssemblyTransportPort {
  openStream(
    cursor: AssemblyFeedCursor,
    observer: AssemblyStreamObserver,
  ): () => void {
    const source = new EventSource(
      sameOriginUrl(STREAM_PATH, cursor).toString(),
    );
    let closed = false;
    let expectedCursor = cursor.afterCursor + 1;
    let expectedVersion = cursor.projectVersion;
    const close = () => {
      if (closed) return;
      closed = true;
      source.close();
    };
    source.onopen = () => {
      if (!closed) observer.onOpen();
    };
    const onWorkEvent = (rawEvent: Event) => {
      const message = rawEvent as MessageEvent<string>;
      if (closed) return;
      try {
        if (
          message.lastEventId !== String(expectedCursor) ||
          new TextEncoder().encode(message.data).byteLength > MAX_EVENT_BYTES
        ) {
          throw new DomainValidationError();
        }
        const parsed = parseProjectEvent(
          JSON.parse(message.data) as unknown,
          cursor.fixtureVersion,
        );
        if (
          !parsed.ok ||
          !eventMatchesCursor(
            parsed.event,
            cursor,
            expectedCursor,
            expectedVersion,
          )
        ) {
          throw new DomainValidationError();
        }
        expectedCursor += 1;
        expectedVersion += 1;
        observer.onEvent(parsed.event);
      } catch {
        close();
        observer.onFailure("invalid_stream_payload");
      }
    };
    source.addEventListener("work", onWorkEvent);
    source.onerror = () => {
      if (closed) return;
      close();
      observer.onFailure(
        expectedCursor === cursor.afterCursor + 1
          ? "connection_failed"
          : "stream_closed",
      );
    };
    return () => {
      source.removeEventListener("work", onWorkEvent);
      close();
    };
  }

  // @ah SEC-TRANSPORT-PAYLOAD-BOUND
  async poll(
    cursor: AssemblyFeedCursor,
    signal: AbortSignal,
  ): Promise<AssemblyPollBatch> {
    const response = await fetch(sameOriginUrl(POLL_PATH, cursor), {
      method: "GET",
      headers: { Accept: "application/json" },
      cache: "no-store",
      credentials: "omit",
      redirect: "error",
      signal,
    });
    if (!response.ok) throw new Error("ASSEMBLY_POLL_FAILED");
    const text = await response.text();
    if (new TextEncoder().encode(text).byteLength > MAX_POLL_BYTES) {
      throw new Error("ASSEMBLY_POLL_TOO_LARGE");
    }
    return parsePollBatch(JSON.parse(text) as unknown, cursor);
  }
}

export class BrowserAssemblyTimer implements AssemblyTimerPort {
  nowMs(): number {
    return Date.now();
  }

  setAlarm(callback: () => void, delayMs: number): () => void {
    const timer = window.setTimeout(callback, delayMs);
    return () => window.clearTimeout(timer);
  }

  delay(delayMs: number, signal: AbortSignal): Promise<void> {
    return new Promise((resolve, reject) => {
      if (signal.aborted) {
        reject(new DOMException("Aborted", "AbortError"));
        return;
      }
      const timer = window.setTimeout(() => {
        signal.removeEventListener("abort", onAbort);
        resolve();
      }, delayMs);
      const onAbort = () => {
        window.clearTimeout(timer);
        reject(new DOMException("Aborted", "AbortError"));
      };
      signal.addEventListener("abort", onAbort, { once: true });
    });
  }
}

export function createBrowserLiveRoofAssemblyController(
  runtime: SessionProjectRuntime,
  options: { policy?: AssemblyPollingPolicy } = {},
): LiveRoofAssemblyController {
  return new LiveRoofAssemblyController(
    runtime,
    new BrowserAssemblyTransport(),
    new BrowserAssemblyTimer(),
    options.policy ?? DEFAULT_ASSEMBLY_POLLING_POLICY,
  );
}
