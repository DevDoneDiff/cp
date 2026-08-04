/**
 * MODULE: src/project/ui/persistent-scene-shell.tsx
 * PURPOSE: Render one stable semantic property-scene boundary across confirmation, assembly, and minimum readiness.
 * PUBLIC API / ENTRYPOINTS:
 *   - PersistentSceneShell: data-bound scene, camera, roof, panel, fact, and readiness semantics.
 * INVARIANTS:
 *   - [INV-SCENE-CONTINUITY] The scene element is keyed by stable scene identity and is not replaced as accepted work changes.
 *   - [INV-FACT-EVENT-GATING] Roof, panel, energy, and readiness content appears only when its canonical projection data exists.
 * BOUNDARIES:
 *   - This is a temporary semantic shell, not the final S2 composition, imagery, outline layer, or renderer.
 * RELATED:
 *   - src/project/ui/pre-account-runtime.tsx: keeps this component in one stable JSX position.
 *   - src/project/domain/model.ts: defines the stable scene and panel data rendered here.
 */
import type { SessionProjectProjection } from "../domain/model";

export interface PersistentSceneShellProps {
  projection: SessionProjectProjection;
}

export function PersistentSceneShell({
  projection,
}: PersistentSceneShellProps) {
  const scene = projection.scene;
  const property = projection.property;
  if (scene === null || property === null) return null;

  // @ah INV-SCENE-CONTINUITY
  return (
    <section
      className="scene-shell"
      aria-labelledby="scene-shell-title"
      data-scene-shell="persistent"
      data-scene-id={scene.scene_id}
      data-camera-id={scene.camera_id}
      data-property-id={property.property_id}
    >
      <div>
        <p className="eyebrow">Semantic scene boundary</p>
        <h2 id="scene-shell-title">Persistent property scene</h2>
        <p>
          This temporary contract shell keeps one scene and camera context while
          accepted roof and panel objects are added.
        </p>
      </div>

      <dl className="identity-grid" aria-label="Stable project identities">
        <div>
          <dt>Scene ID</dt>
          <dd data-testid="scene-id">{scene.scene_id}</dd>
        </div>
        <div>
          <dt>Camera ID</dt>
          <dd data-testid="camera-id">{scene.camera_id}</dd>
        </div>
        <div>
          <dt>Property ID</dt>
          <dd data-testid="property-id">{property.property_id}</dd>
        </div>
      </dl>

      {/* @ah INV-FACT-EVENT-GATING */}
      {projection.roof_facts ? (
        <p data-testid="roof-facts">
          Modeled roof area: {projection.roof_facts.modeled_roof_area_sq_ft} sq
          ft
        </p>
      ) : (
        <p>Roof geometry has not been accepted yet.</p>
      )}

      <div aria-live="polite" aria-atomic="true">
        <p>Stable panel objects: {projection.panel_objects.length}</p>
        {projection.panel_objects.length > 0 ? (
          <ol className="panel-object-list" aria-label="Accepted panel objects">
            {projection.panel_objects.map((panel) => (
              <li
                key={panel.panel_id}
                data-panel-id={panel.panel_id}
                data-surface-id={panel.surface_id}
                data-placement-rank={panel.placement_rank}
              >
                Panel {panel.placement_rank}: rendered, unselected
              </li>
            ))}
          </ol>
        ) : null}
      </div>

      {projection.energy_model ? (
        <p data-testid="energy-model">
          Modeled annual energy: {projection.energy_model.modeled_annual_kwh}{" "}
          kWh
        </p>
      ) : null}

      <p
        role="status"
        data-minimum-usable-ready={
          projection.minimum_usable_ready ? "true" : "false"
        }
      >
        {projection.minimum_usable_ready
          ? "Minimum usable property and panel model ready"
          : "Minimum usable model is not ready"}
      </p>
    </section>
  );
}
