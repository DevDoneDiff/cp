import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  BrowserAssemblyTimer,
  BrowserAssemblyTransport,
} from "../../src/project/adapters/browser-assembly-transport";
import { assemblyFeedCursorFromProjection } from "../../src/project/application/live-roof-assembly";
import type { ProjectEvent } from "../../src/project/domain/model";
import {
  confirmProject,
  createRuntimeHarness,
  startProject,
} from "../helpers/project-runtime";

const APP_ORIGIN = "https://contractor-platform.test";

class FakeEventSource {
  static instances: FakeEventSource[] = [];

  readonly listeners = new Map<string, (event: Event) => void>();
  readonly close = vi.fn();
  onopen: (() => void) | null = null;
  onerror: (() => void) | null = null;

  constructor(readonly url: string) {
    FakeEventSource.instances.push(this);
  }

  addEventListener(type: string, listener: EventListenerOrEventListenerObject) {
    this.listeners.set(type, (event) => {
      if (typeof listener === "function") listener(event);
      else listener.handleEvent(event);
    });
  }

  removeEventListener(type: string) {
    this.listeners.delete(type);
  }

  emitOpen() {
    this.onopen?.();
  }

  emitWork(data: string, lastEventId: string) {
    this.listeners.get("work")?.({ data, lastEventId } as MessageEvent<string>);
  }

  emitError() {
    this.onerror?.();
  }
}

function confirmedFeed() {
  const harness = createRuntimeHarness();
  startProject(harness.runtime);
  const confirmed = confirmProject(harness.runtime);
  const cursor = assemblyFeedCursorFromProjection(confirmed);
  const event = harness.schedule.nextEvent(confirmed);
  if (cursor === null || event === null) {
    throw new Error("CONFIRMED_FEED_MISSING");
  }
  return { ...harness, confirmed, cursor, event };
}

function pollEnvelope(
  fixtureVersion: string,
  afterCursor: number,
  events: ProjectEvent[],
) {
  return {
    schema_version: 1,
    fixture_version: fixtureVersion,
    after_cursor: afterCursor,
    feed_complete: false,
    events,
  };
}

beforeEach(() => {
  FakeEventSource.instances = [];
  vi.stubGlobal("EventSource", FakeEventSource);
  vi.stubGlobal("window", {
    location: { origin: APP_ORIGIN },
    setTimeout,
    clearTimeout,
  });
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe("browser assembly transport", () => {
  it("opens only the exact same-origin stream and publishes one cursor-bound event", () => {
    const { cursor, event } = confirmedFeed();
    const observer = {
      onOpen: vi.fn(),
      onEvent: vi.fn(),
      onFailure: vi.fn(),
    };
    const cancel = new BrowserAssemblyTransport().openStream(cursor, observer);
    const source = FakeEventSource.instances[0];
    if (source === undefined) throw new Error("EVENT_SOURCE_MISSING");

    const url = new URL(source.url);
    expect(url.origin).toBe(APP_ORIGIN);
    expect(url.pathname).toBe("/api/project/assembly/stream");
    expect([...url.searchParams.keys()].sort()).toEqual(
      [
        "after_cursor",
        "candidate_ordinal",
        "confirmation_cursor",
        "confirmation_occurred_at",
        "fixture_version",
        "project_version",
        "property_id",
        "session_project_id",
      ].sort(),
    );
    expect(source.url).not.toContain("123+Maple");
    source.emitOpen();
    source.emitWork(JSON.stringify(event), String(event.cursor));

    expect(observer.onOpen).toHaveBeenCalledOnce();
    expect(observer.onEvent).toHaveBeenCalledWith(event);
    expect(observer.onFailure).not.toHaveBeenCalled();
    source.emitError();
    expect(observer.onFailure).toHaveBeenCalledWith("stream_closed");
    expect(source.close).toHaveBeenCalledOnce();
    cancel();
    expect(source.listeners.has("work")).toBe(false);
  });

  it.each([
    {
      label: "wrong SSE id",
      mutate: (event: ProjectEvent) => ({
        data: JSON.stringify(event),
        lastEventId: String(event.cursor + 1),
      }),
    },
    {
      label: "foreign project",
      mutate: (event: ProjectEvent) => ({
        data: JSON.stringify({
          ...event,
          session_project_id: "project-foreign",
        }),
        lastEventId: String(event.cursor),
      }),
    },
    {
      label: "malformed JSON",
      mutate: (event: ProjectEvent) => ({
        data: "{",
        lastEventId: String(event.cursor),
      }),
    },
    {
      label: "oversized payload",
      mutate: (event: ProjectEvent) => ({
        data: JSON.stringify({ ...event, padding: "x".repeat(32_000) }),
        lastEventId: String(event.cursor),
      }),
    },
  ])("rejects a $label before publication", ({ mutate }) => {
    const { cursor, event } = confirmedFeed();
    const observer = {
      onOpen: vi.fn(),
      onEvent: vi.fn(),
      onFailure: vi.fn(),
    };
    new BrowserAssemblyTransport().openStream(cursor, observer);
    const source = FakeEventSource.instances[0];
    if (source === undefined) throw new Error("EVENT_SOURCE_MISSING");
    const payload = mutate(event);

    source.emitWork(payload.data, payload.lastEventId);

    expect(observer.onEvent).not.toHaveBeenCalled();
    expect(observer.onFailure).toHaveBeenCalledOnce();
    expect(observer.onFailure).toHaveBeenCalledWith("invalid_stream_payload");
    expect(source.close).toHaveBeenCalledOnce();
  });

  it("treats a stream error before the first accepted event as connection failure", () => {
    const { cursor } = confirmedFeed();
    const observer = {
      onOpen: vi.fn(),
      onEvent: vi.fn(),
      onFailure: vi.fn(),
    };
    new BrowserAssemblyTransport().openStream(cursor, observer);
    const source = FakeEventSource.instances[0];
    if (source === undefined) throw new Error("EVENT_SOURCE_MISSING");

    source.emitError();

    expect(observer.onFailure).toHaveBeenCalledWith("connection_failed");
    expect(source.close).toHaveBeenCalledOnce();
  });

  it("polls with a credential-free exact same-origin request and parses a valid batch", async () => {
    const { cursor, event } = confirmedFeed();
    const fetchMock = vi
      .fn()
      .mockResolvedValue(
        new Response(
          JSON.stringify(
            pollEnvelope(cursor.fixtureVersion, cursor.afterCursor, [event]),
          ),
          { status: 200 },
        ),
      );
    vi.stubGlobal("fetch", fetchMock);
    const abort = new AbortController();

    const batch = await new BrowserAssemblyTransport().poll(
      cursor,
      abort.signal,
    );

    expect(batch).toEqual({ events: [event], feedComplete: false });
    expect(fetchMock).toHaveBeenCalledOnce();
    const [requestedUrl, init] = fetchMock.mock.calls[0] as [URL, RequestInit];
    expect(requestedUrl.origin).toBe(APP_ORIGIN);
    expect(requestedUrl.pathname).toBe("/api/project/assembly/poll");
    expect(init).toMatchObject({
      method: "GET",
      cache: "no-store",
      credentials: "omit",
      redirect: "error",
      signal: abort.signal,
    });
  });

  it.each([
    {
      label: "extra response field",
      response: (
        fixtureVersion: string,
        afterCursor: number,
        event: ProjectEvent,
      ) => ({
        ...pollEnvelope(fixtureVersion, afterCursor, [event]),
        unexpected: true,
      }),
    },
    {
      label: "foreign event",
      response: (
        fixtureVersion: string,
        afterCursor: number,
        event: ProjectEvent,
      ) =>
        pollEnvelope(fixtureVersion, afterCursor, [
          { ...event, property_id: "property-foreign" },
        ]),
    },
    {
      label: "replayed cursor",
      response: (
        fixtureVersion: string,
        afterCursor: number,
        event: ProjectEvent,
      ) =>
        pollEnvelope(fixtureVersion, afterCursor, [
          {
            ...event,
            cursor: afterCursor,
            expected_project_version: afterCursor - 1,
          },
        ]),
    },
  ])("rejects a polling batch with an $label", async ({ response }) => {
    const { cursor, event } = confirmedFeed();
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValue(
          new Response(
            JSON.stringify(
              response(cursor.fixtureVersion, cursor.afterCursor, event),
            ),
            { status: 200 },
          ),
        ),
    );

    await expect(
      new BrowserAssemblyTransport().poll(cursor, new AbortController().signal),
    ).rejects.toThrow();
  });

  it("rejects non-success and oversized polling responses", async () => {
    const { cursor } = confirmedFeed();
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(new Response("unavailable", { status: 503 }))
      .mockResolvedValueOnce(new Response("x".repeat(64_001), { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);
    const transport = new BrowserAssemblyTransport();

    await expect(
      transport.poll(cursor, new AbortController().signal),
    ).rejects.toThrow("ASSEMBLY_POLL_FAILED");
    await expect(
      transport.poll(cursor, new AbortController().signal),
    ).rejects.toThrow("ASSEMBLY_POLL_TOO_LARGE");
  });
});

describe("browser assembly timer", () => {
  it("cancels alarms and rejects an aborted delay", async () => {
    vi.useFakeTimers();
    const timer = new BrowserAssemblyTimer();
    const alarm = vi.fn();
    const cancel = timer.setAlarm(alarm, 100);
    cancel();
    await vi.advanceTimersByTimeAsync(100);
    expect(alarm).not.toHaveBeenCalled();

    const abort = new AbortController();
    const pending = timer.delay(100, abort.signal);
    abort.abort();
    await expect(pending).rejects.toMatchObject({ name: "AbortError" });
  });
});
