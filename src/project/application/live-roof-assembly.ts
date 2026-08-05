/**
 * MODULE: src/project/application/live-roof-assembly.ts
 * PURPOSE: Orchestrate one cancellable SSE-first assembly attempt with bounded cursor polling fallback and retry.
 * PUBLIC API / ENTRYPOINTS:
 *   - LiveRoofAssemblyController: transient transport lifecycle and subscription boundary.
 *   - AssemblyTransportPort: replaceable source of validated typed work events.
 *   - assemblyFeedCursorFromProjection: derives correlation only from the latest accepted projection.
 * INVARIANTS:
 *   - [INV-ACCEPTED-CURSOR-RESUME] Every connect, fallback, and retry resumes from the runtime's latest accepted cursor.
 *   - [INV-BOUNDED-POLLING] One fallback attempt stops at the configured request or duration budget.
 *   - [BOUNDARY-TRANSPORT-NONAUTHORITY] Transport phase never creates facts, panels, progress, or readiness; only runtime event acceptance can.
 * BOUNDARIES:
 *   - Browser APIs and wire parsing belong to the transport adapter; domain acceptance and persistence remain in SessionProjectRuntime.
 * RELATED:
 *   - src/project/application/session-project-runtime.ts: validates, applies, and persists candidate work events.
 *   - src/project/adapters/browser-assembly-transport.ts: implements native EventSource, fetch, and timers.
 *   - src/project/domain/reducer.ts: owns event order, identity, idempotency, and readiness.
 * EVENTS:
 *   - Consumes validated modeled work events and publishes transient connection, fallback, exhaustion, and ready status.
 */
import type { ProjectEvent, SessionProjectProjection } from "../domain/model";
import type { SessionProjectRuntime } from "./session-project-runtime";

export interface AssemblyFeedCursor {
  fixtureVersion: string;
  sessionProjectId: string;
  propertyId: string;
  candidateOrdinal: number;
  confirmationCursor: number;
  confirmationOccurredAt: string;
  afterCursor: number;
  projectVersion: number;
}

export type AssemblyFallbackReason =
  | "connection_failed"
  | "stream_closed"
  | "stream_stalled"
  | "invalid_stream_payload";

export type AssemblyTransportPhase =
  "idle" | "connecting" | "streaming" | "polling" | "exhausted" | "ready";

export interface AssemblyControllerSnapshot {
  phase: AssemblyTransportPhase;
  fallbackReason: AssemblyFallbackReason | null;
  pollRequests: number;
  attempt: number;
}

export interface AssemblyStreamObserver {
  onOpen(): void;
  onEvent(event: ProjectEvent): void;
  onFailure(reason: AssemblyFallbackReason): void;
}

export interface AssemblyPollBatch {
  events: ProjectEvent[];
  feedComplete: boolean;
}

export interface AssemblyTransportPort {
  openStream(
    cursor: AssemblyFeedCursor,
    observer: AssemblyStreamObserver,
  ): () => void;
  poll(
    cursor: AssemblyFeedCursor,
    signal: AbortSignal,
  ): Promise<AssemblyPollBatch>;
}

export interface AssemblyTimerPort {
  nowMs(): number;
  setAlarm(callback: () => void, delayMs: number): () => void;
  delay(delayMs: number, signal: AbortSignal): Promise<void>;
}

export interface AssemblyPollingPolicy {
  stallTimeoutMs: number;
  pollIntervalMs: number;
  pollRequestTimeoutMs: number;
  maxPollRequests: number;
  maxPollDurationMs: number;
}

export const DEFAULT_ASSEMBLY_POLLING_POLICY: AssemblyPollingPolicy = {
  stallTimeoutMs: 7_000,
  pollIntervalMs: 1_000,
  pollRequestTimeoutMs: 5_000,
  maxPollRequests: 35,
  maxPollDurationMs: 35_000,
};

type Listener = () => void;

export function assemblyFeedCursorFromProjection(
  projection: SessionProjectProjection | null,
): AssemblyFeedCursor | null {
  if (
    projection === null ||
    projection.visible_state !== "LIVE_ROOF_ASSEMBLY" ||
    projection.minimum_usable_ready ||
    projection.property === null
  ) {
    return null;
  }
  const candidateOrdinal = projection.events.filter(
    (event) => event.type === "ADDRESS_RESOLVED",
  ).length;
  const confirmation = projection.events.findLast(
    (event) =>
      event.type === "PROPERTY_CONFIRMED" &&
      event.property_id === projection.property?.property_id,
  );
  if (candidateOrdinal < 1 || confirmation === undefined) return null;
  return {
    fixtureVersion: projection.fixture_version,
    sessionProjectId: projection.session_project_id,
    propertyId: projection.property.property_id,
    candidateOrdinal,
    confirmationCursor: confirmation.cursor,
    confirmationOccurredAt: confirmation.occurred_at,
    afterCursor: projection.latest_cursor,
    projectVersion: projection.project_version,
  };
}

export class LiveRoofAssemblyController {
  private snapshot: AssemblyControllerSnapshot = {
    phase: "idle",
    fallbackReason: null,
    pollRequests: 0,
    attempt: 0,
  };
  private readonly listeners = new Set<Listener>();
  private generation = 0;
  private active = false;
  private cancelStream: (() => void) | null = null;
  private cancelStall: (() => void) | null = null;
  private pollAbort: AbortController | null = null;

  constructor(
    private readonly runtime: SessionProjectRuntime,
    private readonly transport: AssemblyTransportPort,
    private readonly timer: AssemblyTimerPort,
    private readonly policy: AssemblyPollingPolicy = DEFAULT_ASSEMBLY_POLLING_POLICY,
  ) {}

  getSnapshot = (): AssemblyControllerSnapshot => this.snapshot;

  subscribe = (listener: Listener): (() => void) => {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  };

  private publish(changes: Partial<AssemblyControllerSnapshot>): void {
    this.snapshot = Object.freeze({ ...this.snapshot, ...changes });
    for (const listener of this.listeners) listener();
  }

  private cancelActiveWork(): void {
    this.cancelStream?.();
    this.cancelStream = null;
    this.cancelStall?.();
    this.cancelStall = null;
    this.pollAbort?.abort();
    this.pollAbort = null;
  }

  private markReady(): void {
    this.active = false;
    this.cancelActiveWork();
    this.publish({ phase: "ready", fallbackReason: null });
  }

  private scheduleStall(generation: number): void {
    this.cancelStall?.();
    this.cancelStall = this.timer.setAlarm(() => {
      if (this.active && generation === this.generation) {
        this.beginPolling(generation, "stream_stalled");
      }
    }, this.policy.stallTimeoutMs);
  }

  private acceptCandidateEvent(event: ProjectEvent): boolean {
    // @ah BOUNDARY-TRANSPORT-NONAUTHORITY
    const result = this.runtime.dispatch({
      type: "APPLY_WORK_EVENT",
      event,
    });
    return result.ok;
  }

  // @ah INV-ACCEPTED-CURSOR-RESUME
  start(): void {
    const projection = this.runtime.getSnapshot().projection;
    if (projection?.minimum_usable_ready) {
      this.markReady();
      return;
    }
    const cursor = assemblyFeedCursorFromProjection(projection);
    if (cursor === null || this.active) return;

    this.active = true;
    const generation = ++this.generation;
    this.cancelActiveWork();
    this.publish({
      phase: "connecting",
      fallbackReason: null,
      pollRequests: 0,
      attempt: this.snapshot.attempt + 1,
    });
    this.scheduleStall(generation);
    try {
      this.cancelStream = this.transport.openStream(cursor, {
        onOpen: () => {
          if (!this.active || generation !== this.generation) return;
          this.publish({ phase: "streaming" });
          this.scheduleStall(generation);
        },
        onEvent: (event) => {
          if (!this.active || generation !== this.generation) return;
          this.scheduleStall(generation);
          if (!this.acceptCandidateEvent(event)) {
            this.beginPolling(generation, "invalid_stream_payload");
            return;
          }
          if (this.runtime.getSnapshot().projection?.minimum_usable_ready) {
            this.markReady();
          }
        },
        onFailure: (reason) => {
          if (!this.active || generation !== this.generation) return;
          if (this.runtime.getSnapshot().projection?.minimum_usable_ready) {
            this.markReady();
            return;
          }
          this.beginPolling(generation, reason);
        },
      });
    } catch {
      this.beginPolling(generation, "connection_failed");
    }
  }

  private beginPolling(
    generation: number,
    reason: AssemblyFallbackReason,
  ): void {
    if (!this.active || generation !== this.generation) return;
    this.cancelStream?.();
    this.cancelStream = null;
    this.cancelStall?.();
    this.cancelStall = null;
    this.pollAbort?.abort();
    const abort = new AbortController();
    this.pollAbort = abort;
    this.publish({ phase: "polling", fallbackReason: reason, pollRequests: 0 });
    void this.runPolling(generation, abort);
  }

  // @ah INV-BOUNDED-POLLING
  private async runPolling(
    generation: number,
    abort: AbortController,
  ): Promise<void> {
    const startedAt = this.timer.nowMs();
    let requests = 0;
    while (
      this.active &&
      generation === this.generation &&
      !abort.signal.aborted &&
      requests < this.policy.maxPollRequests &&
      this.timer.nowMs() - startedAt < this.policy.maxPollDurationMs
    ) {
      const projection = this.runtime.getSnapshot().projection;
      if (projection?.minimum_usable_ready) {
        this.markReady();
        return;
      }
      const cursor = assemblyFeedCursorFromProjection(projection);
      if (cursor === null) break;
      requests += 1;
      this.publish({ pollRequests: requests });
      const requestAbort = new AbortController();
      const abortRequest = () => requestAbort.abort();
      abort.signal.addEventListener("abort", abortRequest, { once: true });
      const remainingDuration = Math.max(
        1,
        this.policy.maxPollDurationMs - (this.timer.nowMs() - startedAt),
      );
      const cancelRequestTimeout = this.timer.setAlarm(
        abortRequest,
        Math.min(this.policy.pollRequestTimeoutMs, remainingDuration),
      );
      try {
        const batch = await this.transport.poll(cursor, requestAbort.signal);
        if (abort.signal.aborted || generation !== this.generation) return;
        for (const event of batch.events) {
          if (!this.acceptCandidateEvent(event)) {
            this.exhaust(generation);
            return;
          }
          if (this.runtime.getSnapshot().projection?.minimum_usable_ready) {
            this.markReady();
            return;
          }
        }
        if (batch.feedComplete) {
          this.exhaust(generation);
          return;
        }
      } catch {
        if (abort.signal.aborted || generation !== this.generation) return;
      } finally {
        cancelRequestTimeout();
        abort.signal.removeEventListener("abort", abortRequest);
      }
      try {
        await this.timer.delay(this.policy.pollIntervalMs, abort.signal);
      } catch {
        return;
      }
    }
    this.exhaust(generation);
  }

  private exhaust(generation: number): void {
    if (!this.active || generation !== this.generation) return;
    this.active = false;
    this.cancelActiveWork();
    this.publish({ phase: "exhausted" });
  }

  retry(): void {
    if (this.snapshot.phase !== "exhausted") return;
    this.active = false;
    this.generation += 1;
    this.cancelActiveWork();
    this.publish({ phase: "idle", fallbackReason: null, pollRequests: 0 });
    this.start();
  }

  stop(): void {
    this.active = false;
    this.generation += 1;
    this.cancelActiveWork();
    if (this.snapshot.phase !== "ready") {
      this.publish({ phase: "idle", fallbackReason: null, pollRequests: 0 });
    }
  }
}
