/**
 * MODULE: src/project/adapters/browser-runtime.ts
 * PURPOSE: Provide native browser sessionStorage, cryptographic project-ID, system-clock, and runtime composition adapters.
 * PUBLIC API / ENTRYPOINTS:
 *   - BrowserSessionProjectStore: validated current-key storage plus isolated delivered-v1 compatibility.
 *   - BrowserIdentitySource and SystemClock: production identity and time boundaries.
 *   - createBrowserSessionProjectRuntime: client-safe composition root for the pre-account runtime.
 * INVARIANTS:
 *   - [SEC-SESSION-STORAGE-ONLY] Unsaved pre-account projection data stays in sessionStorage; canonical and delivered-v1 formats never share a write key.
 *   - [SEC-BOUNDED-STORAGE-RECOVERY] Missing state is fresh; invalid state is removed before recovery, and refused cleanup remains truthfully unavailable.
 *   - [SEC-MIXED-KEY-RESTORE] Simultaneous canonical and delivered-v1 values quarantine legacy provenance before bounded cleanup; incomplete cleanup remains non-restorable.
 *   - [SEC-CROSS-KEY-PUBLICATION] An active contract cannot publish while the opposite provenance key exists.
 *   - Delivered v1 storage remains on its isolated key and never writes into the canonical current-format key.
 * BOUNDARIES:
 *   - Browser globals are accessed only inside adapter methods; no localStorage, cookie, network, durable store, or module-load access is allowed.
 * RELATED:
 *   - src/project/domain/projection.ts: validates and serializes the untrusted projection.
 *   - src/project/application/session-project-runtime.ts: owns atomic command orchestration and publication.
 *   - src/project/domain/identity.ts: supplies shared deterministic semantic IDs for browser and server adapters.
 */
import {
  SessionProjectRuntime,
  type SessionProjectStore,
  type StoreLoadResult,
  type StoreSaveResult,
} from "../application/session-project-runtime";
import { type Clock, type IdentitySource } from "../domain/model";
import { semanticStableId } from "../domain/identity";
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

export const SESSION_PROJECT_STORAGE_KEY = "cp.pre-account-project.v2";
export const LEGACY_SESSION_PROJECT_STORAGE_KEY = "cp.pre-account-project.v1";
const MIXED_PROVENANCE_QUARANTINE = "!MIXED_PROVENANCE_REJECTED!";

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
  private legacySessionActive = false;

  constructor(
    private readonly adapters: SeededDemoAdapters,
    private readonly identity: IdentitySource,
    private readonly storageProvider: StorageProvider = browserSessionStorage,
  ) {}

  private discardInvalid(storage: StorageLike, key: string): boolean {
    try {
      storage.removeItem(key);
      return storage.getItem(key) === null;
    } catch {
      return false;
    }
  }

  private discardMixedProvenance(storage: StorageLike): boolean {
    try {
      storage.setItem(
        LEGACY_SESSION_PROJECT_STORAGE_KEY,
        MIXED_PROVENANCE_QUARANTINE,
      );
      if (
        storage.getItem(LEGACY_SESSION_PROJECT_STORAGE_KEY) !==
        MIXED_PROVENANCE_QUARANTINE
      ) {
        return false;
      }
    } catch {
      return false;
    }
    if (!this.discardInvalid(storage, SESSION_PROJECT_STORAGE_KEY)) {
      return false;
    }
    return this.discardInvalid(storage, LEGACY_SESSION_PROJECT_STORAGE_KEY);
  }

  private invalidRecoveryResult(
    storage: StorageLike,
    key: string,
  ): StoreLoadResult {
    return this.discardInvalid(storage, key)
      ? { kind: "recovered_invalid" }
      : { kind: "unavailable" };
  }

  // @ah SEC-BOUNDED-STORAGE-RECOVERY
  load(): StoreLoadResult {
    this.legacySessionActive = false;
    let storage: StorageLike;
    let serialized: string | null;
    let storageKey = SESSION_PROJECT_STORAGE_KEY;
    let legacyV1Compatibility = false;
    try {
      storage = this.storageProvider();
      const canonicalSerialized = storage.getItem(SESSION_PROJECT_STORAGE_KEY);
      const legacySerialized = storage.getItem(
        LEGACY_SESSION_PROJECT_STORAGE_KEY,
      );
      // @ah SEC-MIXED-KEY-RESTORE
      if (canonicalSerialized !== null && legacySerialized !== null) {
        return this.discardMixedProvenance(storage)
          ? { kind: "recovered_invalid" }
          : { kind: "unavailable" };
      }
      serialized = canonicalSerialized;
      if (serialized === null) {
        storageKey = LEGACY_SESSION_PROJECT_STORAGE_KEY;
        legacyV1Compatibility = true;
        serialized = legacySerialized;
      }
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
      return this.invalidRecoveryResult(storage, storageKey);
    }
    let unknownProjection: unknown;
    try {
      unknownProjection = JSON.parse(serialized) as unknown;
    } catch {
      return this.invalidRecoveryResult(storage, storageKey);
    }
    const parsed = parseSessionProjectProjection(
      unknownProjection,
      this.adapters.fixture,
      this.identity,
      {
        legacyV1Compatibility,
        expectedAssemblyProvenanceContract: legacyV1Compatibility
          ? "LEGACY_UNVERIFIED_V1"
          : "CANONICAL_SCHEDULE_V1",
      },
    );
    if (!parsed.ok) {
      return this.invalidRecoveryResult(storage, storageKey);
    }
    this.legacySessionActive = legacyV1Compatibility;
    return { kind: "restored", projection: parsed.projection };
  }

  // @ah SEC-SESSION-STORAGE-ONLY
  save(
    projection: Parameters<SessionProjectStore["save"]>[0],
  ): StoreSaveResult {
    const serialized = serializeSessionProjectProjection(
      projection,
      this.adapters.fixture,
      this.identity,
    );
    if (!serialized.ok) {
      return { ok: false, reason: "INVALID" };
    }
    const isLegacyProjection =
      serialized.projection.assembly_provenance_contract ===
      "LEGACY_UNVERIFIED_V1";
    if (isLegacyProjection !== this.legacySessionActive) {
      return { ok: false, reason: "INVALID" };
    }
    try {
      const storage = this.storageProvider();
      const oppositeKey = isLegacyProjection
        ? SESSION_PROJECT_STORAGE_KEY
        : LEGACY_SESSION_PROJECT_STORAGE_KEY;
      // @ah SEC-CROSS-KEY-PUBLICATION
      if (storage.getItem(oppositeKey) !== null) {
        return { ok: false, reason: "INVALID" };
      }
      if (isLegacyProjection) {
        const legacyProjection: Record<string, unknown> = {
          ...serialized.projection,
        };
        delete legacyProjection.assembly_provenance_contract;
        const legacySerialized = JSON.stringify(legacyProjection);
        if (
          sessionProjectByteLength(legacySerialized) > MAX_SESSION_PROJECT_BYTES
        ) {
          return { ok: false, reason: "INVALID" };
        }
        storage.setItem(LEGACY_SESSION_PROJECT_STORAGE_KEY, legacySerialized);
      } else {
        storage.setItem(SESSION_PROJECT_STORAGE_KEY, serialized.serialized);
      }
      return { ok: true, projection: serialized.projection };
    } catch {
      return { ok: false, reason: "UNAVAILABLE" };
    }
  }
}

export class BrowserIdentitySource implements IdentitySource {
  createProjectId(): string {
    if (!globalThis.crypto?.randomUUID) {
      throw new Error("PROJECT_ID_UNAVAILABLE");
    }
    return `project-${globalThis.crypto.randomUUID()}`;
  }

  stableId(sessionProjectId: string, semanticKey: string): string {
    return semanticStableId(sessionProjectId, semanticKey);
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
  const store = new BrowserSessionProjectStore(adapters, identity);
  const schedule = new SeededManualSchedule(adapters, identity, clock);
  return new SessionProjectRuntime({
    adapters,
    identity,
    clock,
    store,
    schedule,
  });
}
