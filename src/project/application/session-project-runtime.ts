/**
 * MODULE: src/project/application/session-project-runtime.ts
 * PURPOSE: Coordinate typed pre-account commands, seeded adapters, domain transitions, atomic session persistence, and UI publication.
 * PUBLIC API / ENTRYPOINTS:
 *   - SessionProjectRuntime: single authoritative in-memory controller and subscription surface.
 *   - RuntimeCommand and RuntimeSnapshot: typed application boundary consumed by the semantic shell.
 *   - SessionProjectStore: injected browser-session persistence port.
 * INVARIANTS:
 *   - [DATA-ATOMIC-SESSION-COMMIT] A proposed projection is validated and persisted before it becomes observable runtime state.
 *   - [INV-SINGLE-PROJECT-ROOT] Repeated address selection cannot create a second active session project.
 *   - [INV-IMMUTABLE-RUNTIME-SNAPSHOT] Published snapshots and every nested projection value are deeply frozen.
 * BOUNDARIES:
 *   - Untrusted work-event ingress accepts modeled assembly events only; address, correction, and confirmation authority stays behind application commands.
 *   - The controller knows no browser global, transport, timer, server database, provider, or rendering implementation.
 * RELATED:
 *   - src/project/domain/reducer.ts: owns pure transition legality.
 *   - src/project/adapters/seeded-demo.ts: supplies deterministic replaceable fixture adapters and the inert schedule.
 *   - src/project/adapters/browser-runtime.ts: supplies native sessionStorage, ID, and clock implementations.
 */
import {
  type Clock,
  type IdentitySource,
  type ProjectEventType,
  type SessionProjectProjection,
  type VisibleProjectState,
} from "../domain/model";
import { parseSessionProjectProjection } from "../domain/projection";
import { applyProjectEvent } from "../domain/reducer";
import { parseProjectEvent } from "../domain/work-events";
import {
  createAddressResolvedEvent,
  createPropertyConfirmedEvent,
  createPropertyCorrectionEvent,
  type ManualProjectSchedule,
  type SeededDemoAdapters,
} from "../adapters/seeded-demo";

export type StoreLoadResult =
  | { kind: "empty" }
  | { kind: "restored"; projection: SessionProjectProjection }
  | { kind: "recovered_invalid" }
  | { kind: "unavailable" };

export type StoreSaveResult =
  | { ok: true; projection: SessionProjectProjection }
  | { ok: false; reason: "INVALID" | "UNAVAILABLE" };

export interface SessionProjectStore {
  load(): StoreLoadResult;
  save(projection: SessionProjectProjection): StoreSaveResult;
}

export type RuntimeErrorCode =
  | "ADDRESS_NOT_SUPPORTED"
  | "COMMAND_BUSY"
  | "DOMAIN_REJECTED"
  | "EVENT_REJECTED"
  | "IDENTITY_UNAVAILABLE"
  | "NO_NEXT_EVENT"
  | "STORAGE_UNAVAILABLE";

export type RestoreStatus =
  "not_checked" | "empty" | "restored" | "recovered_invalid" | "unavailable";

export interface RuntimeSnapshot {
  projection: SessionProjectProjection | null;
  visible_state: VisibleProjectState;
  restore_status: RestoreStatus;
  error_code: RuntimeErrorCode | null;
}

export type RuntimeCommand =
  | { type: "RESTORE_SESSION" }
  | { type: "RESOLVE_SEEDED_ADDRESS"; input: string }
  | { type: "CONFIRM_PROPERTY" }
  | { type: "CORRECT_PROPERTY" }
  | { type: "APPLY_WORK_EVENT"; event: unknown }
  | { type: "ADVANCE_SEEDED_WORK" };

export type RuntimeCommandResult =
  | { ok: true; outcome: "accepted" | "idempotent" | "restored" | "empty" }
  | { ok: false; error_code: RuntimeErrorCode };

export interface SessionProjectRuntimeDependencies {
  store: SessionProjectStore;
  identity: IdentitySource;
  clock: Clock;
  schedule: ManualProjectSchedule;
  adapters: SeededDemoAdapters;
}

type Listener = () => void;

const MODELED_WORK_EVENT_TYPES = new Set<ProjectEventType>([
  "ROOF_GEOMETRY_READY",
  "PANEL_OBJECT_ADDED",
  "ENERGY_MODEL_READY",
  "MINIMUM_USABLE_READY",
]);

function deepFreeze<T>(value: T): T {
  if (typeof value !== "object" || value === null || Object.isFrozen(value)) {
    return value;
  }
  for (const child of Object.values(value)) {
    deepFreeze(child);
  }
  return Object.freeze(value);
}

function freshSnapshot(
  restoreStatus: RestoreStatus = "not_checked",
  errorCode: RuntimeErrorCode | null = null,
): RuntimeSnapshot {
  return deepFreeze({
    projection: null,
    visible_state: "ADDRESS_ENTRY",
    restore_status: restoreStatus,
    error_code: errorCode,
  });
}

export class SessionProjectRuntime {
  private snapshot: RuntimeSnapshot = freshSnapshot();
  private readonly listeners = new Set<Listener>();
  private commandActive = false;

  constructor(
    private readonly dependencies: SessionProjectRuntimeDependencies,
  ) {}

  getSnapshot = (): RuntimeSnapshot => this.snapshot;

  subscribe = (listener: Listener): (() => void) => {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  };

  private publish(snapshot: RuntimeSnapshot): void {
    // @ah INV-IMMUTABLE-RUNTIME-SNAPSHOT
    this.snapshot = deepFreeze(snapshot);
    for (const listener of this.listeners) listener();
  }

  private publishError(errorCode: RuntimeErrorCode): RuntimeCommandResult {
    this.publish({ ...this.snapshot, error_code: errorCode });
    return { ok: false, error_code: errorCode };
  }

  private commit(proposed: SessionProjectProjection): RuntimeCommandResult {
    const parsed = parseSessionProjectProjection(
      proposed,
      this.dependencies.adapters.fixture,
      this.dependencies.identity,
    );
    if (!parsed.ok) {
      return this.publishError("DOMAIN_REJECTED");
    }

    // @ah DATA-ATOMIC-SESSION-COMMIT
    const stored = this.dependencies.store.save(parsed.projection);
    if (!stored.ok) {
      return this.publishError("STORAGE_UNAVAILABLE");
    }
    this.publish({
      projection: stored.projection,
      visible_state: stored.projection.visible_state,
      restore_status: this.snapshot.restore_status,
      error_code: null,
    });
    return { ok: true, outcome: "accepted" };
  }

  private restore(): RuntimeCommandResult {
    const loaded = this.dependencies.store.load();
    switch (loaded.kind) {
      case "restored":
        this.publish({
          projection: loaded.projection,
          visible_state: loaded.projection.visible_state,
          restore_status: "restored",
          error_code: null,
        });
        return { ok: true, outcome: "restored" };
      case "empty":
        this.publish(freshSnapshot("empty"));
        return { ok: true, outcome: "empty" };
      case "recovered_invalid":
        this.publish(freshSnapshot("recovered_invalid"));
        return { ok: true, outcome: "empty" };
      case "unavailable":
        this.publish(freshSnapshot("unavailable", "STORAGE_UNAVAILABLE"));
        return { ok: false, error_code: "STORAGE_UNAVAILABLE" };
    }
  }

  private resolveAddress(input: unknown): RuntimeCommandResult {
    const current = this.snapshot.projection;
    if (current !== null && current.property !== null) {
      // @ah INV-SINGLE-PROJECT-ROOT
      return { ok: true, outcome: "idempotent" };
    }
    if (current !== null && current.visible_state !== "ADDRESS_ENTRY") {
      return this.publishError("DOMAIN_REJECTED");
    }
    const resolution = this.dependencies.adapters.address.resolve(input);
    if (resolution === null) {
      return this.publishError("ADDRESS_NOT_SUPPORTED");
    }

    let sessionProjectId: string;
    try {
      sessionProjectId =
        current?.session_project_id ??
        this.dependencies.identity.createProjectId();
    } catch {
      return this.publishError("IDENTITY_UNAVAILABLE");
    }
    const candidateOrdinal =
      (current?.events.filter((event) => event.type === "ADDRESS_RESOLVED")
        .length ?? 0) + 1;
    let event;
    try {
      event = createAddressResolvedEvent({
        sessionProjectId,
        candidateOrdinal,
        currentProjection: current,
        addressDraft: resolution.address_draft,
        normalizedAddress: resolution.normalized_address,
        identity: this.dependencies.identity,
        clock: this.dependencies.clock,
        adapters: this.dependencies.adapters,
      });
    } catch {
      return this.publishError("IDENTITY_UNAVAILABLE");
    }
    const transition = applyProjectEvent(
      current,
      event,
      this.dependencies.adapters.fixture,
      this.dependencies.identity,
    );
    return transition.kind === "accepted"
      ? this.commit(transition.projection)
      : transition.kind === "idempotent"
        ? { ok: true, outcome: "idempotent" }
        : this.publishError("DOMAIN_REJECTED");
  }

  private confirmProperty(): RuntimeCommandResult {
    const current = this.snapshot.projection;
    if (current === null) return this.publishError("DOMAIN_REJECTED");
    const event = createPropertyConfirmedEvent(
      current,
      this.dependencies.identity,
      this.dependencies.clock,
    );
    if (event === null) return this.publishError("DOMAIN_REJECTED");
    return this.applyParsedEvent(event, "application");
  }

  private correctProperty(): RuntimeCommandResult {
    const current = this.snapshot.projection;
    if (current === null) return this.publishError("DOMAIN_REJECTED");
    const event = createPropertyCorrectionEvent(
      current,
      this.dependencies.identity,
      this.dependencies.clock,
    );
    if (event === null) return this.publishError("DOMAIN_REJECTED");
    return this.applyParsedEvent(event, "application");
  }

  private applyParsedEvent(
    event: unknown,
    authority: "application" | "modeled_work",
  ): RuntimeCommandResult {
    const parsed = parseProjectEvent(
      event,
      this.dependencies.adapters.fixture.fixture_version,
    );
    if (!parsed.ok) return this.publishError("EVENT_REJECTED");
    if (
      authority === "modeled_work" &&
      !MODELED_WORK_EVENT_TYPES.has(parsed.event.type)
    ) {
      return this.publishError("EVENT_REJECTED");
    }
    const current = this.snapshot.projection;
    const transition = applyProjectEvent(
      current,
      parsed.event,
      this.dependencies.adapters.fixture,
      this.dependencies.identity,
    );
    if (transition.kind === "idempotent") {
      return { ok: true, outcome: "idempotent" };
    }
    return transition.kind === "accepted"
      ? this.commit(transition.projection)
      : this.publishError("EVENT_REJECTED");
  }

  private advanceSeededWork(): RuntimeCommandResult {
    const current = this.snapshot.projection;
    if (current === null) return this.publishError("NO_NEXT_EVENT");
    const event = this.dependencies.schedule.nextEvent(current);
    return event === null
      ? this.publishError("NO_NEXT_EVENT")
      : this.applyParsedEvent(event, "modeled_work");
  }

  dispatch(command: RuntimeCommand): RuntimeCommandResult {
    if (this.commandActive) {
      return { ok: false, error_code: "COMMAND_BUSY" };
    }
    this.commandActive = true;
    try {
      switch (command.type) {
        case "RESTORE_SESSION":
          return this.restore();
        case "RESOLVE_SEEDED_ADDRESS":
          return this.resolveAddress(command.input);
        case "CONFIRM_PROPERTY":
          return this.confirmProperty();
        case "CORRECT_PROPERTY":
          return this.correctProperty();
        case "APPLY_WORK_EVENT":
          return this.applyParsedEvent(command.event, "modeled_work");
        case "ADVANCE_SEEDED_WORK":
          return this.advanceSeededWork();
      }
    } finally {
      this.commandActive = false;
    }
  }
}
