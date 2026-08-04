/**
 * MODULE: src/project/ui/pre-account-runtime.tsx
 * PURPOSE: Hydrate the browser-session runtime and render the approved S2 property-confirmation composition plus its minimal semantic assembly handoff.
 * PUBLIC API / ENTRYPOINTS:
 *   - PreAccountRuntime: client subscription, restore, focus, confirmation/correction commands, fallback, and state semantics.
 * INVARIANTS:
 *   - [INV-ONE-RUNTIME-SHELL] One application-runtime instance owns projection state for the mounted pre-account environment.
 *   - [INV-NO-S3-SURFACE] The shell renders no assembly progression, S3 controls, pricing, account, or later state.
 * BOUNDARIES:
 *   - Confirmation and correction dispatch existing canonical commands; this UI never owns state, persistence, work events, transport, or modeled facts.
 * RELATED:
 *   - src/project/application/session-project-runtime.ts: owns commands and canonical state publication.
 *   - src/project/ui/persistent-scene-shell.tsx: remains mounted through confirmation and the semantic assembly handoff.
 *   - src/project/ui/address-entry-experience.tsx: owns client navigation into and out of this persistent shell.
 */
"use client";

import { useEffect, useRef, useState } from "react";

import {
  type RuntimeErrorCode,
  SessionProjectRuntime,
} from "../application/session-project-runtime";
import { createBrowserSessionProjectRuntime } from "../adapters/browser-runtime";
import {
  PersistentSceneShell,
  PROPERTY_SCENE_ASSET,
} from "./persistent-scene-shell";

const ERROR_COPY: Record<RuntimeErrorCode, string> = {
  ADDRESS_NOT_SUPPORTED:
    "This browser-session project accepts only the seeded demo address.",
  COMMAND_BUSY: "The previous project action is still being handled.",
  DOMAIN_REJECTED:
    "That action is not available for the current project state. Your existing project is unchanged.",
  EVENT_REJECTED:
    "An unsupported work update was rejected. Your existing project is unchanged.",
  IDENTITY_UNAVAILABLE:
    "A browser-session project identity could not be created.",
  NO_NEXT_EVENT: "No modeled work is available in this confirmation state.",
  STORAGE_UNAVAILABLE:
    "This browser could not save the change. Your existing project is unchanged. Try again.",
};

export interface PreAccountRuntimeProps {
  runtime?: SessionProjectRuntime;
  onNavigate?: (href: string) => void;
}

function SolarWordmark() {
  return (
    <div className="wordmark s2-wordmark" aria-label="Solar project platform">
      <span className="solar-mark" aria-hidden="true">
        <span className="solar-mark-core" />
        <span className="solar-mark-rays" />
      </span>
      <span>SOLAR</span>
    </div>
  );
}

export function PreAccountRuntime({
  runtime,
  onNavigate = () => undefined,
}: PreAccountRuntimeProps) {
  // @ah INV-ONE-RUNTIME-SHELL
  const [activeRuntime] = useState(
    () => runtime ?? createBrowserSessionProjectRuntime(),
  );
  const [snapshot, setSnapshot] = useState(activeRuntime.getSnapshot);
  const [assetFailed, setAssetFailed] = useState(false);
  const stateHeadingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const unsubscribe = activeRuntime.subscribe(() => {
      setSnapshot(activeRuntime.getSnapshot());
    });
    if (activeRuntime.getSnapshot().restore_status === "not_checked") {
      activeRuntime.dispatch({ type: "RESTORE_SESSION" });
    }
    return unsubscribe;
  }, [activeRuntime]);

  useEffect(() => {
    if (snapshot.visible_state !== "ADDRESS_ENTRY") {
      stateHeadingRef.current?.focus();
    }
  }, [snapshot.visible_state]);

  const projection = snapshot.projection;
  if (projection?.property === null || projection?.scene === null) return null;
  if (projection === null) return null;

  const normalizedAddress = projection.normalized_address;
  const isConfirmation = snapshot.visible_state === "PROPERTY_CONFIRMATION";

  const confirmProperty = () => {
    activeRuntime.dispatch({ type: "CONFIRM_PROPERTY" });
  };

  const correctProperty = () => {
    const result = activeRuntime.dispatch({ type: "CORRECT_PROPERTY" });
    if (result.ok) onNavigate("/");
  };

  return (
    <section
      className="s2-frame"
      aria-labelledby="s2-state-title"
      data-visible-state={snapshot.visible_state}
    >
      <header className="s2-header">
        <SolarWordmark />
        <p className="s2-address-context">
          <span className="visually-hidden">Submitted address: </span>
          {normalizedAddress?.formatted_address ??
            projection.property.display_address}
        </p>
        <p className="s2-session-context">
          <span aria-hidden="true" />
          Browser-session project
        </p>
      </header>

      <div className="s2-notice-region" aria-live="polite">
        {snapshot.error_code ? (
          <p className="s2-error" role="alert">
            {ERROR_COPY[snapshot.error_code]}
          </p>
        ) : assetFailed ? (
          <p className="s2-error" role="status">
            Seeded demo property image unavailable. Property identity and
            details remain unchanged.
          </p>
        ) : snapshot.restore_status === "restored" ? (
          <p className="s2-notice" role="status">
            This project was restored from this browser session.
          </p>
        ) : null}
      </div>

      <div className="s2-stage">
        <section className="s2-decision" aria-labelledby="s2-state-title">
          <p className="s2-eyebrow">
            {isConfirmation ? "Property confirmation" : "Confirmation recorded"}
          </p>
          <h1 id="s2-state-title" ref={stateHeadingRef} tabIndex={-1}>
            {isConfirmation ? "Is this your property?" : "Property confirmed."}
          </h1>
          {isConfirmation ? (
            <>
              <p className="s2-lead">
                We found one likely demo match for the address you entered.
              </p>
              <p className="s2-supporting">
                Confirm this property before roof analysis begins.
              </p>
              <div className="s2-actions">
                <button
                  type="button"
                  className="s2-primary-action"
                  onClick={confirmProperty}
                >
                  <span>Yes, this is my property</span>
                  <span aria-hidden="true">&#x2192;</span>
                </button>
                <button
                  type="button"
                  className="s2-correction-action"
                  onClick={correctProperty}
                >
                  Not your property?
                </button>
              </div>
              <div className="s2-privacy">
                <span className="s2-privacy-mark" aria-hidden="true" />
                <p>
                  <strong>We protect your privacy.</strong>
                  <span>No contractor receives this project.</span>
                </p>
              </div>
            </>
          ) : (
            <>
              <p className="s2-lead">
                This demo property is now tied to the same browser-session
                project.
              </p>
              <p className="s2-supporting">
                Roof analysis is pending and has not started yet.
              </p>
              {/* @ah INV-NO-S3-SURFACE */}
              <p className="s2-confirmed-status" role="status">
                Confirmation recorded
              </p>
            </>
          )}
        </section>

        <PersistentSceneShell
          projection={projection}
          assetFailed={assetFailed}
          onAssetError={() => setAssetFailed(true)}
        />

        <aside className="s2-details" aria-labelledby="property-details-title">
          <h2 id="property-details-title">Property details</h2>
          <div
            className={`s2-details-thumbnail${assetFailed ? " is-unavailable" : ""}`}
            aria-hidden="true"
            data-scene-asset-id={PROPERTY_SCENE_ASSET.id}
          >
            {assetFailed ? <span>Preview unavailable</span> : null}
          </div>
          <p className="s2-property-address">
            <strong>
              {normalizedAddress?.street_line ??
                projection.property.display_address}
            </strong>
            {normalizedAddress ? (
              <span>
                {normalizedAddress.locality}, {normalizedAddress.region}{" "}
                {normalizedAddress.postal_code}
              </span>
            ) : null}
          </p>
          <dl className="s2-source-list">
            <div>
              <dt>Imagery source</dt>
              <dd>Seeded demo imagery</dd>
            </div>
            <div>
              <dt>Match certainty</dt>
              <dd>Demo property match</dd>
            </div>
            <div>
              <dt>Candidate boundary</dt>
              <dd>Modeled</dd>
            </div>
          </dl>
          <p className="s2-details-note">
            {isConfirmation
              ? "Confirm or correct this match before roof analysis begins."
              : "Confirmation is saved. Roof analysis remains pending."}
          </p>
        </aside>

        <section className="s2-known" aria-labelledby="known-state-title">
          <h2 id="known-state-title">What we know so far</h2>
          <ul>
            <li>
              <span className="s2-status-mark is-known" aria-hidden="true" />
              <span>
                <strong>Address</strong>
                <small>Normalized</small>
              </span>
            </li>
            <li>
              <span className="s2-status-mark is-known" aria-hidden="true" />
              <span>
                <strong>Property</strong>
                <small>
                  {isConfirmation
                    ? "Likely candidate located"
                    : "Confirmed by you"}
                </small>
              </span>
            </li>
            <li>
              <span className="s2-status-mark is-known" aria-hidden="true" />
              <span>
                <strong>Scene</strong>
                <small>
                  {assetFailed
                    ? "Image unavailable; details retained"
                    : "Seeded demo imagery"}
                </small>
              </span>
            </li>
            <li>
              <span className="s2-status-mark is-pending" aria-hidden="true" />
              <span>
                <strong>Roof analysis</strong>
                <small>
                  {isConfirmation ? "Pending confirmation" : "Pending"}
                </small>
              </span>
            </li>
          </ul>
          <p className="s2-known-note">
            {isConfirmation
              ? "Confirmation keeps this likely match tied to the same evolving project."
              : "The same property scene and project context will remain in place when analysis begins."}
          </p>
        </section>
      </div>

      <p className="visually-hidden" role="status" aria-live="polite">
        {isConfirmation
          ? "Likely property candidate ready for confirmation. Roof analysis is pending."
          : "Property confirmed. Roof analysis is pending."}
      </p>
    </section>
  );
}
