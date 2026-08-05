import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  LiveRoofAssemblyController,
  type AssemblyFeedCursor,
  type AssemblyPollBatch,
  type AssemblyPollingPolicy,
  type AssemblyStreamObserver,
  type AssemblyTimerPort,
  type AssemblyTransportPort,
} from "../../src/project/application/live-roof-assembly";
import type { ProjectEvent } from "../../src/project/domain/model";
import {
  confirmProject,
  createRuntimeHarness,
  startProject,
} from "../helpers/project-runtime";

class FakeTimer implements AssemblyTimerPort {
  nowMs(): number {
    return Date.now();
  }

  setAlarm(callback: () => void, delayMs: number): () => void {
    const handle = setTimeout(callback, delayMs);
    return () => clearTimeout(handle);
  }

  delay(delayMs: number, signal: AbortSignal): Promise<void> {
    return new Promise((resolve, reject) => {
      const handle = setTimeout(resolve, delayMs);
      signal.addEventListener(
        "abort",
        () => {
          clearTimeout(handle);
          reject(new DOMException("Aborted", "AbortError"));
        },
        { once: true },
      );
    });
  }
}

class FakeTransport implements AssemblyTransportPort {
  observer: AssemblyStreamObserver | null = null;
  openCursors: AssemblyFeedCursor[] = [];
  pollCursors: AssemblyFeedCursor[] = [];
  closes = 0;
  pollResult: (cursor: AssemblyFeedCursor) => AssemblyPollBatch = () => ({
    events: [],
    feedComplete: false,
  });

  openStream(cursor: AssemblyFeedCursor, observer: AssemblyStreamObserver) {
    this.openCursors.push(cursor);
    this.observer = observer;
    return () => {
      this.closes += 1;
    };
  }

  async poll(
    cursor: AssemblyFeedCursor,
    signal: AbortSignal,
  ): Promise<AssemblyPollBatch> {
    void signal;
    this.pollCursors.push(cursor);
    return this.pollResult(cursor);
  }
}

const policy: AssemblyPollingPolicy = {
  stallTimeoutMs: 20,
  pollIntervalMs: 5,
  pollRequestTimeoutMs: 10,
  maxPollRequests: 10,
  maxPollDurationMs: 100,
};

beforeEach(() => {
  vi.useFakeTimers({ now: new Date("2026-01-01T00:00:00.000Z") });
});

afterEach(() => {
  vi.useRealTimers();
});

describe("live roof assembly controller", () => {
  it("accepts the complete SSE sequence and stops ready without polling", () => {
    const { runtime, schedule } = createRuntimeHarness();
    startProject(runtime);
    confirmProject(runtime);
    const transport = new FakeTransport();
    const controller = new LiveRoofAssemblyController(
      runtime,
      transport,
      new FakeTimer(),
      policy,
    );

    controller.start();
    transport.observer?.onOpen();
    for (let index = 0; index < 7; index += 1) {
      const projection = runtime.getSnapshot().projection;
      if (projection === null) throw new Error("PROJECTION_MISSING");
      const event = schedule.nextEvent(projection);
      if (event === null) throw new Error("WORK_EVENT_MISSING");
      transport.observer?.onEvent(event);
    }

    expect(controller.getSnapshot()).toMatchObject({
      phase: "ready",
      attempt: 1,
    });
    expect(runtime.getSnapshot().projection?.minimum_usable_ready).toBe(true);
    expect(transport.pollCursors).toEqual([]);
    expect(transport.closes).toBeGreaterThanOrEqual(1);
  });

  it("falls back from the latest accepted cursor and reaches ready through serial polling", async () => {
    const { runtime, schedule } = createRuntimeHarness();
    startProject(runtime);
    confirmProject(runtime);
    const transport = new FakeTransport();
    const phases: string[] = [];
    transport.pollResult = () => {
      const projection = runtime.getSnapshot().projection;
      if (projection === null) throw new Error("PROJECTION_MISSING");
      const event = schedule.nextEvent(projection);
      return { events: event === null ? [] : [event], feedComplete: false };
    };
    const controller = new LiveRoofAssemblyController(
      runtime,
      transport,
      new FakeTimer(),
      policy,
    );
    controller.subscribe(() => phases.push(controller.getSnapshot().phase));

    controller.start();
    const first = schedule.nextEvent(runtime.getSnapshot().projection!);
    if (first === null) throw new Error("FIRST_EVENT_MISSING");
    transport.observer?.onEvent(first);
    const acceptedCursor = runtime.getSnapshot().projection?.latest_cursor;
    transport.observer?.onFailure("stream_closed");
    await vi.runAllTimersAsync();

    expect(phases).toContain("polling");
    expect(controller.getSnapshot().phase).toBe("ready");
    expect(transport.pollCursors[0]?.afterCursor).toBe(acceptedCursor);
    expect(runtime.getSnapshot().projection?.panel_objects).toHaveLength(4);
  });

  it("exhausts a bounded attempt without mutation and retries from the same cursor", async () => {
    const { runtime, schedule } = createRuntimeHarness();
    startProject(runtime);
    const confirmed = confirmProject(runtime);
    const transport = new FakeTransport();
    const boundedPolicy = { ...policy, maxPollRequests: 3 };
    const controller = new LiveRoofAssemblyController(
      runtime,
      transport,
      new FakeTimer(),
      boundedPolicy,
    );

    controller.start();
    transport.observer?.onFailure("connection_failed");
    await vi.runAllTimersAsync();
    expect(controller.getSnapshot()).toMatchObject({
      phase: "exhausted",
      pollRequests: 3,
    });
    expect(runtime.getSnapshot().projection).toEqual(confirmed);

    controller.retry();
    expect(transport.openCursors.at(-1)?.afterCursor).toBe(
      confirmed.latest_cursor,
    );
    for (let index = 0; index < 7; index += 1) {
      const event = schedule.nextEvent(runtime.getSnapshot().projection!);
      if (event === null) throw new Error("RETRY_EVENT_MISSING");
      transport.observer?.onEvent(event);
    }
    expect(controller.getSnapshot().phase).toBe("ready");
  });

  it("treats a silent stream as stalled and ignores late callbacks after stop", async () => {
    const { runtime, schedule } = createRuntimeHarness();
    startProject(runtime);
    confirmProject(runtime);
    const transport = new FakeTransport();
    const controller = new LiveRoofAssemblyController(
      runtime,
      transport,
      new FakeTimer(),
      { ...policy, maxPollRequests: 1 },
    );

    controller.start();
    await vi.advanceTimersByTimeAsync(policy.stallTimeoutMs);
    await vi.runAllTimersAsync();
    expect(controller.getSnapshot().phase).toBe("exhausted");
    const beforeStop = runtime.getSnapshot().projection;
    controller.stop();
    const lateEvent: ProjectEvent | null = schedule.nextEvent(beforeStop!);
    if (lateEvent === null) throw new Error("LATE_EVENT_MISSING");
    transport.observer?.onEvent(lateEvent);
    expect(runtime.getSnapshot().projection).toEqual(beforeStop);
  });
});
