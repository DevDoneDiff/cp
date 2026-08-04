/**
 * MODULE: src/project/ui/pre-account-runtime.tsx
 * PURPOSE: Hydrate the browser-session runtime and expose the truthful semantic S2 intermediate shell reached from S1.
 * PUBLIC API / ENTRYPOINTS:
 *   - PreAccountRuntime: client subscription, restore, focus, command controls, and state semantics.
 * INVARIANTS:
 *   - [INV-ONE-RUNTIME-SHELL] One application-runtime instance owns projection state for the mounted pre-account environment.
 *   - [INV-NO-S3-SURFACE] The shell stops at minimum usability and renders no S3 controls, pricing, account, or later state.
 * BOUNDARIES:
 *   - This shell deliberately does not claim final S1/S2 visual composition, imagery, motion, or live assembly transport.
 * RELATED:
 *   - src/project/application/session-project-runtime.ts: owns commands and canonical state publication.
 *   - src/project/ui/persistent-scene-shell.tsx: remains mounted through confirmation, assembly, and readiness.
 *   - src/app/page.tsx: owns the server-rendered product-runtime marker.
 */
"use client";

import { useEffect, useRef, useState } from "react";
import {
  type RuntimeErrorCode,
  SessionProjectRuntime,
} from "../application/session-project-runtime";
import { createBrowserSessionProjectRuntime } from "../adapters/browser-runtime";
import { PersistentSceneShell } from "./persistent-scene-shell";

const ERROR_COPY: Record<RuntimeErrorCode, string> = {
  ADDRESS_NOT_SUPPORTED:
    "This temporary runtime accepts only the seeded demo address.",
  COMMAND_BUSY: "The previous runtime command is still being handled.",
  DOMAIN_REJECTED: "That action is not valid for the current project state.",
  EVENT_REJECTED:
    "The modeled work event was rejected without changing the project.",
  IDENTITY_UNAVAILABLE:
    "A session project could not be created in this browser.",
  NO_NEXT_EVENT: "No additional modeled work event is available.",
  STORAGE_UNAVAILABLE:
    "Session storage is unavailable, so the project was not changed.",
};

export interface PreAccountRuntimeProps {
  runtime?: SessionProjectRuntime;
}

export function PreAccountRuntime({ runtime }: PreAccountRuntimeProps) {
  // @ah INV-ONE-RUNTIME-SHELL
  const [activeRuntime] = useState(
    () => runtime ?? createBrowserSessionProjectRuntime(),
  );
  const [snapshot, setSnapshot] = useState(activeRuntime.getSnapshot);
  const stateHeadingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const unsubscribe = activeRuntime.subscribe(() => {
      setSnapshot(activeRuntime.getSnapshot());
    });
    activeRuntime.dispatch({ type: "RESTORE_SESSION" });
    return unsubscribe;
  }, [activeRuntime]);

  useEffect(() => {
    if (snapshot.visible_state !== "ADDRESS_ENTRY") {
      stateHeadingRef.current?.focus();
    }
  }, [snapshot.visible_state]);

  const projection = snapshot.projection;

  return (
    <section
      className="runtime-shell"
      aria-labelledby="contract-state-title"
      data-visible-state={snapshot.visible_state}
    >
      {snapshot.restore_status === "recovered_invalid" ? (
        <p role="status" className="notice">
          Invalid session data was cleared. A fresh address-entry session is
          ready.
        </p>
      ) : null}
      {snapshot.restore_status === "restored" ? (
        <p role="status" className="notice">
          This project was restored from this browser session.
        </p>
      ) : null}
      {snapshot.error_code ? (
        <p role="alert" className="error-message">
          {ERROR_COPY[snapshot.error_code]}
        </p>
      ) : null}

      <section className="contract-controls" aria-label="Current project state">
        <p className="eyebrow">Temporary contract controls</p>
        <h1 id="contract-state-title" ref={stateHeadingRef} tabIndex={-1}>
          {snapshot.visible_state === "ADDRESS_ENTRY"
            ? "Address entry runtime"
            : snapshot.visible_state === "PROPERTY_CONFIRMATION"
              ? "Property confirmation runtime"
              : "Live roof assembly runtime"}
        </h1>

        {snapshot.visible_state === "ADDRESS_ENTRY" ? (
          <>
            <p>
              {projection
                ? `Previous input preserved: ${projection.address_draft}`
                : "No session project exists in this browser session yet."}
            </p>
            <button
              type="button"
              onClick={() =>
                activeRuntime.dispatch({
                  type: "RESOLVE_SEEDED_ADDRESS",
                  input: "123 Maple St",
                })
              }
            >
              Create seeded project for 123 Maple St
            </button>
          </>
        ) : null}

        {snapshot.visible_state === "PROPERTY_CONFIRMATION" && projection ? (
          <>
            <dl className="source-list">
              <div>
                <dt>Imagery source</dt>
                <dd>Seeded demo imagery</dd>
              </div>
              <div>
                <dt>Match certainty</dt>
                <dd>Demo property match</dd>
              </div>
            </dl>
            <p>{projection.normalized_address?.formatted_address}</p>
            <div className="button-row">
              <button
                type="button"
                onClick={() =>
                  activeRuntime.dispatch({ type: "CONFIRM_PROPERTY" })
                }
              >
                Confirm demo property
              </button>
              <button
                type="button"
                className="secondary-button"
                onClick={() =>
                  activeRuntime.dispatch({ type: "CORRECT_PROPERTY" })
                }
              >
                Correct seeded address
              </button>
            </div>
          </>
        ) : null}

        {snapshot.visible_state === "LIVE_ROOF_ASSEMBLY" && projection ? (
          <>
            <p>
              Project version {projection.project_version}; accepted cursor{" "}
              {projection.latest_cursor}.
            </p>
            {projection.minimum_usable_ready ? (
              // @ah INV-NO-S3-SURFACE
              <p className="ready-message">
                The preliminary property and panel model is ready. This task
                stops here.
              </p>
            ) : (
              <button
                type="button"
                onClick={() =>
                  activeRuntime.dispatch({ type: "ADVANCE_SEEDED_WORK" })
                }
              >
                Apply next modeled work event
              </button>
            )}
          </>
        ) : null}
      </section>

      {projection?.scene ? (
        <PersistentSceneShell projection={projection} />
      ) : (
        <section
          className="scene-shell scene-shell-empty"
          aria-label="Scene pending"
        >
          <p>Property scene pending seeded address selection.</p>
        </section>
      )}
    </section>
  );
}
