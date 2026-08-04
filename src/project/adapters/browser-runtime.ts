/**
 * MODULE: src/project/adapters/browser-runtime.ts
 * PURPOSE: Provide native browser sessionStorage, cryptographic project-ID, system-clock, and runtime composition adapters.
 * PUBLIC API / ENTRYPOINTS:
 *   - BrowserSessionProjectStore: one-key validated sessionStorage adapter.
 *   - BrowserIdentitySource and SystemClock: production identity and time boundaries.
 *   - createBrowserSessionProjectRuntime: client-safe composition root for the pre-account runtime.
 * INVARIANTS:
 *   - [SEC-SESSION-STORAGE-ONLY] Unsaved pre-account projection data is read and written only through one versioned sessionStorage key.
 *   - [SEC-BOUNDED-STORAGE-RECOVERY] Missing state is fresh; incompatible, corrupt, oversized, or malicious state is rejected with bounded results.
 * BOUNDARIES:
 *   - Browser globals are accessed only inside adapter methods; no localStorage, cookie, network, durable store, or module-load access is allowed.
 * RELATED:
 *   - src/project/domain/projection.ts: validates and serializes the untrusted projection.
 *   - src/project/application/session-project-runtime.ts: owns atomic command orchestration and publication.
 */
import {
  SessionProjectRuntime,
  type SessionProjectStore,
  type StoreLoadResult,
  type StoreSaveResult,
} from "../application/session-project-runtime";
import { type Clock, type IdentitySource } from "../domain/model";
import {
  MAX_SESSION_PROJECT_BYTES,
  parseSessionProjectProjection,
  sessionProjectByteLength,
  serializeSessionProjectProjection,
} from "../domain/projection";
import {
  createSeededDemoAdapters,
  SeededManualSchedule,
  type SeededDemoAdapters,
} from "./seeded-demo";

export const SESSION_PROJECT_STORAGE_KEY = "cp.pre-account-project.v1";

export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

type StorageProvider = () => StorageLike;

function browserSessionStorage(): StorageLike {
  if (typeof window === "undefined") {
    throw new Error("SESSION_STORAGE_UNAVAILABLE");
  }
  return window.sessionStorage;
}

export class BrowserSessionProjectStore implements SessionProjectStore {
  constructor(
    private readonly adapters: SeededDemoAdapters,
    private readonly storageProvider: StorageProvider = browserSessionStorage,
  ) {}

  private discardInvalid(storage: StorageLike): void {
    try {
      storage.removeItem(SESSION_PROJECT_STORAGE_KEY);
    } catch {
      // Recovery remains fresh even when the browser refuses cleanup.
    }
  }

  // @ah SEC-BOUNDED-STORAGE-RECOVERY
  load(): StoreLoadResult {
    let storage: StorageLike;
    let serialized: string | null;
    try {
      storage = this.storageProvider();
      serialized = storage.getItem(SESSION_PROJECT_STORAGE_KEY);
    } catch {
      return { kind: "unavailable" };
    }
    if (serialized === null) {
      return { kind: "empty" };
    }
    if (
      serialized.length > MAX_SESSION_PROJECT_BYTES ||
      sessionProjectByteLength(serialized) > MAX_SESSION_PROJECT_BYTES
    ) {
      this.discardInvalid(storage);
      return { kind: "recovered_invalid" };
    }
    let unknownProjection: unknown;
    try {
      unknownProjection = JSON.parse(serialized) as unknown;
    } catch {
      this.discardInvalid(storage);
      return { kind: "recovered_invalid" };
    }
    const parsed = parseSessionProjectProjection(
      unknownProjection,
      this.adapters.fixture,
    );
    if (!parsed.ok) {
      this.discardInvalid(storage);
      return { kind: "recovered_invalid" };
    }
    return { kind: "restored", projection: parsed.projection };
  }

  // @ah SEC-SESSION-STORAGE-ONLY
  save(
    projection: Parameters<SessionProjectStore["save"]>[0],
  ): StoreSaveResult {
    const serialized = serializeSessionProjectProjection(
      projection,
      this.adapters.fixture,
    );
    if (!serialized.ok) {
      return { ok: false, reason: "INVALID" };
    }
    try {
      this.storageProvider().setItem(
        SESSION_PROJECT_STORAGE_KEY,
        serialized.serialized,
      );
      return { ok: true, projection: serialized.projection };
    } catch {
      return { ok: false, reason: "UNAVAILABLE" };
    }
  }
}

function stableHash(value: string): string {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(36);
}

export class BrowserIdentitySource implements IdentitySource {
  createProjectId(): string {
    if (!globalThis.crypto?.randomUUID) {
      throw new Error("PROJECT_ID_UNAVAILABLE");
    }
    return `project-${globalThis.crypto.randomUUID()}`;
  }

  stableId(sessionProjectId: string, semanticKey: string): string {
    const safeKey = semanticKey.replace(/[^A-Za-z0-9:_-]/g, "-");
    const candidate = `${sessionProjectId}:${safeKey}`;
    if (candidate.length <= 160) return candidate;
    const suffix = stableHash(safeKey);
    const available = 160 - sessionProjectId.length - suffix.length - 2;
    return `${sessionProjectId}:${safeKey.slice(0, Math.max(1, available))}:${suffix}`;
  }
}

export class SystemClock implements Clock {
  nowIso(): string {
    return new Date().toISOString();
  }
}

export function createBrowserSessionProjectRuntime(): SessionProjectRuntime {
  const adapters = createSeededDemoAdapters();
  const identity = new BrowserIdentitySource();
  const clock = new SystemClock();
  const store = new BrowserSessionProjectStore(adapters);
  const schedule = new SeededManualSchedule(adapters, identity, clock);
  return new SessionProjectRuntime({
    adapters,
    identity,
    clock,
    store,
    schedule,
  });
}
