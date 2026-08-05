/**
 * MODULE: src/project/ui/pre-account-runtime.tsx
 * PURPOSE: Hydrate and render the continuous S2 confirmation and event-driven live roof assembly inside one scene shell.
 * PUBLIC API / ENTRYPOINTS:
 *   - PreAccountRuntime: restore, focus, confirmation/correction, transport lifecycle, retry, and S2 projection semantics.
 * INVARIANTS:
 *   - [INV-ONE-RUNTIME-SHELL] One application-runtime instance owns projection state for the mounted pre-account environment.
 *   - [INV-NO-S3-SURFACE] Minimum usability remains inside S2 and renders no S3 controls, pricing, account, or later state.
 *   - [INV-ONE-ASSEMBLY-CONTROLLER] One controller follows the runtime from accepted confirmation through ready or bounded exhaustion.
 * BOUNDARIES:
 *   - UI and transport status project accepted runtime state; neither can create facts, panels, progress, or readiness.
 * RELATED:
 *   - src/project/application/session-project-runtime.ts: owns commands and canonical state publication.
 *   - src/project/ui/persistent-scene-shell.tsx: remains mounted through every accepted assembly event and readiness.
 *   - src/project/ui/address-entry-experience.tsx: owns client navigation into and out of this persistent shell.
 * EVENTS:
 *   - Announces accepted assembly milestones, object-count progress, transport fallback/exhaustion, restoration, and readiness.
 */
"use client";

import { useEffect, useRef, useState } from "react";

import {
  type RuntimeErrorCode,
  SessionProjectRuntime,
} from "../application/session-project-runtime";
import type { LiveRoofAssemblyController } from "../application/live-roof-assembly";
import { createBrowserLiveRoofAssemblyController } from "../adapters/browser-assembly-transport";
import { createBrowserSessionProjectRuntime } from "../adapters/browser-runtime";
import { SEEDED_DEMO_FIXTURE } from "../adapters/seeded-demo";
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
  assemblyController?: LiveRoofAssemblyController;
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
  assemblyController,
  onNavigate = () => undefined,
}: PreAccountRuntimeProps) {
  // @ah INV-ONE-RUNTIME-SHELL
  const [activeRuntime] = useState(
    () => runtime ?? createBrowserSessionProjectRuntime(),
  );
  const [snapshot, setSnapshot] = useState(activeRuntime.getSnapshot);
  // @ah INV-ONE-ASSEMBLY-CONTROLLER
  const [activeAssemblyController] = useState(
    () =>
      assemblyController ??
      createBrowserLiveRoofAssemblyController(activeRuntime),
  );
  const [assemblySnapshot, setAssemblySnapshot] = useState(
    activeAssemblyController.getSnapshot,
  );
  const [assetFailed, setAssetFailed] = useState(false);
  const stateHeadingRef = useRef<HTMLHeadingElement>(null);
  const focusReadyAfterRetryRef = useRef(false);
  const minimumUsableReady = snapshot.projection?.minimum_usable_ready ?? false;

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
    const unsubscribe = activeAssemblyController.subscribe(() => {
      setAssemblySnapshot(activeAssemblyController.getSnapshot());
    });
    return () => {
      unsubscribe();
      activeAssemblyController.stop();
    };
  }, [activeAssemblyController]);

  useEffect(() => {
    if (snapshot.visible_state === "LIVE_ROOF_ASSEMBLY") {
      activeAssemblyController.start();
    }
  }, [activeAssemblyController, snapshot.visible_state]);

  useEffect(() => {
    if (snapshot.visible_state !== "ADDRESS_ENTRY") {
      stateHeadingRef.current?.focus();
    }
  }, [snapshot.visible_state]);

  useEffect(() => {
    if (focusReadyAfterRetryRef.current && minimumUsableReady) {
      focusReadyAfterRetryRef.current = false;
      stateHeadingRef.current?.focus();
    }
  }, [minimumUsableReady]);

  const projection = snapshot.projection;
  if (projection?.property === null || projection?.scene === null) return null;
  if (projection === null) return null;

  const normalizedAddress = projection.normalized_address;
  const isConfirmation = snapshot.visible_state === "PROPERTY_CONFIRMATION";
  const targetPanelCount = SEEDED_DEMO_FIXTURE.panels.length;
  const panelCount = projection.panel_objects.length;
  const roofReady = projection.roof_surfaces.length > 0;
  const energyReady = projection.energy_model !== null;
  const ready = minimumUsableReady;
  const hasNotice =
    snapshot.error_code !== null ||
    assetFailed ||
    snapshot.restore_status === "restored";
  const assemblyStage = !roofReady
    ? "Mapping modeled roof geometry"
    : panelCount < targetPanelCount
      ? `Placing panel ${panelCount + 1} of ${targetPanelCount}`
      : !energyReady
        ? "Preparing the modeled energy facts"
        : !ready
          ? "Checking the minimum usable model"
          : "Your starting demo model is ready";

  const confirmProperty = () => {
    activeRuntime.dispatch({ type: "CONFIRM_PROPERTY" });
  };

  const correctProperty = () => {
    const result = activeRuntime.dispatch({ type: "CORRECT_PROPERTY" });
    if (result.ok) onNavigate("/");
  };

  const retryAssembly = () => {
    focusReadyAfterRetryRef.current = true;
    activeAssemblyController.retry();
  };

  return (
    <section
      className="s2-frame"
      aria-labelledby="s2-state-title"
      data-visible-state={snapshot.visible_state}
      data-assembly-phase={assemblySnapshot.phase}
      data-panel-count={panelCount}
      data-minimum-usable-ready={ready}
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

      <div
        className={`s2-stage${isConfirmation ? "" : " is-assembly"}${hasNotice ? " has-notice" : ""}`}
      >
        <section
          className={`s2-decision${isConfirmation ? "" : " is-assembly"}`}
          aria-labelledby="s2-state-title"
        >
          <p className="s2-eyebrow">
            {isConfirmation
              ? "Property confirmation"
              : ready
                ? "Minimum usable ready"
                : "Live roof assembly"}
          </p>
          <h1 id="s2-state-title" ref={stateHeadingRef} tabIndex={-1}>
            {isConfirmation
              ? "Is this your property?"
              : ready
                ? "Your starting demo model is ready."
                : "Building your solar model..."}
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
                {ready
                  ? "The confirmed property now has a usable preliminary demo model assembled from accepted seeded work events."
                  : "The confirmed property is becoming a usable preliminary model through accepted seeded work events."}
              </p>
              <p className="s2-supporting">
                {ready
                  ? `Roof facts, ${targetPanelCount} stable panel objects, and modeled energy are recorded at the minimum-usable S2 boundary.`
                  : "Facts and stable panel objects appear only when their modeled work is accepted."}
              </p>
              {/* @ah INV-NO-S3-SURFACE */}
              <section
                className="s2-assembly-work"
                aria-labelledby="live-assembly-title"
              >
                <h2 id="live-assembly-title">Live assembly</h2>
                <ol>
                  <li data-stage-ready="true">
                    <span className="s2-work-mark" aria-hidden="true" />
                    <span>Property confirmed</span>
                    <strong>Ready</strong>
                  </li>
                  <li data-stage-ready={roofReady}>
                    <span className="s2-work-mark" aria-hidden="true" />
                    <span>Roof geometry</span>
                    <strong>{roofReady ? "Ready" : "Pending"}</strong>
                  </li>
                  <li data-stage-ready={panelCount === targetPanelCount}>
                    <span className="s2-work-mark" aria-hidden="true" />
                    <span>Panels placed</span>
                    <strong>
                      {panelCount} / {targetPanelCount}
                    </strong>
                  </li>
                  <li data-stage-ready={energyReady}>
                    <span className="s2-work-mark" aria-hidden="true" />
                    <span>Energy model</span>
                    <strong>{energyReady ? "Ready" : "Waiting"}</strong>
                  </li>
                </ol>
                <progress
                  max={targetPanelCount}
                  value={panelCount}
                  aria-label={`${panelCount} of ${targetPanelCount} stable panel objects placed`}
                />
                <p>Progress is based on accepted panel objects.</p>
              </section>

              {assemblySnapshot.phase === "exhausted" ? (
                <div className="s2-assembly-recovery" role="alert">
                  <strong>Live assembly paused</strong>
                  <p>
                    Updates could not continue within the bounded retry window.
                    Your confirmed property and {panelCount} accepted panel
                    {panelCount === 1 ? " is" : "s are"} still safe in this
                    browser session.
                  </p>
                  <button type="button" onClick={retryAssembly}>
                    Retry assembly
                  </button>
                </div>
              ) : null}
            </>
          )}
        </section>

        <PersistentSceneShell
          projection={projection}
          assetFailed={assetFailed}
          onAssetError={() => setAssetFailed(true)}
        />

        {!isConfirmation ? (
          <>
            <p className={`s2-assembly-badge${ready ? " is-ready" : ""}`}>
              <span className="s2-assembly-pulse" aria-hidden="true" />
              <span>{assemblyStage}</span>
              {panelCount > 0 && !ready ? (
                <strong>
                  {panelCount} / {targetPanelCount}
                </strong>
              ) : null}
            </p>
            <p className="s2-continuity-note">
              Panels appear only as stable objects. The property scene and
              camera stay in place.
            </p>
          </>
        ) : null}

        <aside
          className={`s2-details${isConfirmation ? "" : " is-assembly"}`}
          aria-labelledby="property-details-title"
        >
          <h2 id="property-details-title">
            {isConfirmation ? "Property details" : "Your starting demo model"}
          </h2>
          {isConfirmation ? (
            <div
              className={`s2-details-thumbnail${assetFailed ? " is-unavailable" : ""}`}
              aria-hidden="true"
              data-scene-asset-id={PROPERTY_SCENE_ASSET.id}
            >
              {assetFailed ? <span>Preview unavailable</span> : null}
            </div>
          ) : (
            <p className={`s2-model-state${ready ? " is-ready" : ""}`}>
              {ready ? "Ready in S2" : "Building in place"}
            </p>
          )}
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
            {isConfirmation ? (
              <>
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
              </>
            ) : (
              <>
                <div>
                  <dt>Roof surfaces</dt>
                  <dd>
                    {roofReady ? projection.roof_surfaces.length : "Pending"}
                  </dd>
                </div>
                <div>
                  <dt>Modeled roof area</dt>
                  <dd>
                    {projection.roof_facts
                      ? `${projection.roof_facts.modeled_roof_area_sq_ft.toLocaleString("en-US")} sq ft`
                      : "Pending"}
                  </dd>
                </div>
                <div>
                  <dt>Panel objects</dt>
                  <dd>
                    {panelCount} / {targetPanelCount}
                  </dd>
                </div>
                <div>
                  <dt>Modeled production</dt>
                  <dd>
                    {projection.energy_model
                      ? `${projection.energy_model.modeled_annual_kwh.toLocaleString("en-US")} kWh/yr`
                      : "Pending"}
                  </dd>
                </div>
              </>
            )}
          </dl>
          <p className="s2-details-note">
            {isConfirmation
              ? "Confirm or correct this match before roof analysis begins."
              : ready
                ? "The minimum usable demo model is saved in this browser session. It remains inside S2."
                : assemblySnapshot.phase === "polling"
                  ? "The event stream paused. Bounded polling is continuing from your last accepted update."
                  : "Facts remain pending until their corresponding modeled work event is accepted."}
          </p>
        </aside>

        <section
          className={`s2-known${isConfirmation ? "" : " is-assembly"}`}
          aria-labelledby="known-state-title"
        >
          <h2 id="known-state-title">
            {isConfirmation
              ? "What we know so far"
              : "Facts appear as the model becomes ready"}
          </h2>
          <ul>
            {!isConfirmation ? (
              <li>
                <span
                  className={`s2-status-mark${roofReady ? " is-known" : " is-pending"}`}
                  aria-hidden="true"
                />
                <span>
                  <strong>Roof surfaces</strong>
                  <small>
                    {roofReady
                      ? `${projection.roof_surfaces.length} modeled surfaces`
                      : "Pending roof event"}
                  </small>
                </span>
              </li>
            ) : null}
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
                <strong>{isConfirmation ? "Scene" : "Imagery source"}</strong>
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
                <strong>
                  {isConfirmation ? "Roof analysis" : "Panel objects"}
                </strong>
                <small>
                  {isConfirmation
                    ? "Pending confirmation"
                    : `${panelCount} of ${targetPanelCount} accepted`}
                </small>
              </span>
            </li>
            {!isConfirmation ? (
              <li>
                <span
                  className={`s2-status-mark${energyReady ? " is-known" : " is-pending"}`}
                  aria-hidden="true"
                />
                <span>
                  <strong>Modeled production</strong>
                  <small>
                    {projection.energy_model
                      ? `${projection.energy_model.modeled_annual_kwh.toLocaleString("en-US")} kWh/yr`
                      : "Pending energy event"}
                  </small>
                </span>
              </li>
            ) : null}
          </ul>
          <p className="s2-known-note">
            {isConfirmation
              ? "Confirmation keeps this likely match tied to the same evolving project."
              : ready
                ? "Minimum usable readiness is recorded. No S3 controls or later content are rendered."
                : "Seeded demo imagery and modeled facts remain source-labeled throughout assembly."}
          </p>
        </section>
      </div>

      <p className="visually-hidden" role="status" aria-live="polite">
        {isConfirmation
          ? "Likely property candidate ready for confirmation. Roof analysis is pending."
          : `${assemblyStage}. ${panelCount} of ${targetPanelCount} stable panel objects accepted.${assemblySnapshot.phase === "polling" ? " The event stream paused and bounded polling is active." : ""}${assemblySnapshot.phase === "exhausted" ? " Assembly is paused and can be retried from saved progress." : ""}`}
      </p>
    </section>
  );
}
