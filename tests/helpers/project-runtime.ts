import {
  SessionProjectRuntime,
  type SessionProjectStore,
} from "../../src/project/application/session-project-runtime";
import {
  BrowserSessionProjectStore,
  SESSION_PROJECT_STORAGE_KEY,
  type StorageLike,
} from "../../src/project/adapters/browser-runtime";
import {
  createSeededDemoAdapters,
  SeededManualSchedule,
} from "../../src/project/adapters/seeded-demo";
import type { Clock, IdentitySource } from "../../src/project/domain/model";

export class DeterministicIdentity implements IdentitySource {
  projectCount = 0;

  createProjectId(): string {
    this.projectCount += 1;
    return `project-test-${this.projectCount}`;
  }

  stableId(sessionProjectId: string, semanticKey: string): string {
    return `${sessionProjectId}:${semanticKey}`;
  }
}

export class IncrementingClock implements Clock {
  private tick = 0;

  nowIso(): string {
    const value = new Date(Date.UTC(2026, 0, 1, 0, 0, this.tick));
    this.tick += 1;
    return value.toISOString();
  }
}

export class MemoryStorage implements StorageLike {
  readonly values = new Map<string, string>();
  reads = 0;
  writes = 0;
  removals = 0;
  getError = false;
  setError = false;
  removeError = false;

  getItem(key: string): string | null {
    this.reads += 1;
    if (this.getError) throw new Error("GET_DENIED");
    return this.values.get(key) ?? null;
  }

  setItem(key: string, value: string): void {
    if (this.setError) throw new Error("SET_DENIED");
    this.writes += 1;
    this.values.set(key, value);
  }

  removeItem(key: string): void {
    this.removals += 1;
    if (this.removeError) throw new Error("REMOVE_DENIED");
    this.values.delete(key);
  }

  storedProject(): string | null {
    return this.values.get(SESSION_PROJECT_STORAGE_KEY) ?? null;
  }
}

export function createRuntimeHarness(
  options: {
    storage?: MemoryStorage;
    store?: SessionProjectStore;
  } = {},
) {
  const adapters = createSeededDemoAdapters();
  const identity = new DeterministicIdentity();
  const clock = new IncrementingClock();
  const storage = options.storage ?? new MemoryStorage();
  const store =
    options.store ?? new BrowserSessionProjectStore(adapters, () => storage);
  const schedule = new SeededManualSchedule(adapters, identity, clock);
  const runtime = new SessionProjectRuntime({
    adapters,
    identity,
    clock,
    store,
    schedule,
  });
  return { runtime, adapters, identity, clock, schedule, storage, store };
}

export function startProject(runtime: SessionProjectRuntime) {
  runtime.dispatch({ type: "RESTORE_SESSION" });
  runtime.dispatch({
    type: "RESOLVE_SEEDED_ADDRESS",
    input: "123 Maple St",
  });
  const projection = runtime.getSnapshot().projection;
  if (projection === null) throw new Error("PROJECT_NOT_CREATED");
  return projection;
}

export function confirmProject(runtime: SessionProjectRuntime) {
  runtime.dispatch({ type: "CONFIRM_PROPERTY" });
  const projection = runtime.getSnapshot().projection;
  if (projection === null) throw new Error("PROJECT_NOT_CONFIRMED");
  return projection;
}

export function advanceProjectToReady(runtime: SessionProjectRuntime) {
  for (let step = 0; step < 10; step += 1) {
    const current = runtime.getSnapshot().projection;
    if (current?.minimum_usable_ready) return current;
    runtime.dispatch({ type: "ADVANCE_SEEDED_WORK" });
  }
  throw new Error("PROJECT_DID_NOT_REACH_READY");
}
