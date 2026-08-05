/**
 * MODULE: src/project/ui/persistent-scene-shell.tsx
 * PURPOSE: Render one stable local property scene plus separate candidate, roof-surface, and stable panel layers across S2.
 * PUBLIC API / ENTRYPOINTS:
 *   - PersistentSceneShell: candidate-bound scene image, accessible data layers, fallback, and continuity instrumentation.
 * INVARIANTS:
 *   - [INV-SCENE-CONTINUITY] The scene element remains at one stable component type and JSX position through confirmation.
 *   - [INV-SEPARATE-PROPERTY-OUTLINE] The candidate boundary is fixture-bound SVG geometry and never baked into the raster scene.
 *   - [INV-EVENT-GATED-SCENE-LAYERS] Roof surfaces and keyed panels render only from objects already accepted into the projection.
 * BOUNDARIES:
 *   - The scene renders accepted projection objects only; it does not create geometry, panels, facts, progress, or readiness.
 * RELATED:
 *   - src/project/ui/pre-account-runtime.tsx: keeps this component in one stable JSX position and owns asset-failure view state.
 *   - src/project/domain/model.ts: defines stable candidate, scene, and normalized fixture geometry contracts.
 *   - src/project/adapters/seeded-demo.ts: supplies the trusted local candidate outline.
 */
import Image from "next/image";

import { SEEDED_DEMO_FIXTURE } from "../adapters/seeded-demo";
import type { SessionProjectProjection } from "../domain/model";

const SCENE_VIEWBOX_WIDTH = 1000;
const SCENE_VIEWBOX_HEIGHT = 667;

export const PROPERTY_SCENE_ASSET = {
  id: "seeded-maple-austin-property-scene-v1",
  src: "/images/s2-property-scene.png",
} as const;

export interface PersistentSceneShellProps {
  projection: SessionProjectProjection;
  assetFailed: boolean;
  onAssetError: () => void;
}

function candidateOutlinePoints(projection: SessionProjectProjection): string {
  const property = projection.property;
  const scene = projection.scene;
  if (
    property?.fixture_property_key !==
      SEEDED_DEMO_FIXTURE.property.fixture_property_key ||
    scene?.fixture_scene_key !== SEEDED_DEMO_FIXTURE.scene.fixture_scene_key
  ) {
    return "";
  }
  return SEEDED_DEMO_FIXTURE.property.outline_polygon
    .map(
      (point) =>
        `${Math.round(point.x * SCENE_VIEWBOX_WIDTH)},${Math.round(point.y * SCENE_VIEWBOX_HEIGHT)}`,
    )
    .join(" ");
}

function normalizedPoints(points: readonly { x: number; y: number }[]): string {
  return points
    .map(
      (point) =>
        `${Math.round(point.x * SCENE_VIEWBOX_WIDTH)},${Math.round(point.y * SCENE_VIEWBOX_HEIGHT)}`,
    )
    .join(" ");
}

export function PersistentSceneShell({
  projection,
  assetFailed,
  onAssetError,
}: PersistentSceneShellProps) {
  const scene = projection.scene;
  const property = projection.property;
  if (scene === null || property === null) return null;

  const outlinePoints = candidateOutlinePoints(projection);
  const isConfirmation = projection.visible_state === "PROPERTY_CONFIRMATION";

  // @ah INV-SCENE-CONTINUITY
  return (
    <section
      className="property-scene"
      aria-labelledby="property-scene-title"
      data-scene-shell="persistent"
      data-render-boundary="property-scene-v1"
      data-scene-coordinate-system="fixture-normalized-v1"
      data-scene-id={scene.scene_id}
      data-camera-id={scene.camera_id}
      data-property-id={property.property_id}
      data-scene-asset-id={PROPERTY_SCENE_ASSET.id}
      data-scene-asset-src={PROPERTY_SCENE_ASSET.src}
    >
      <h2 id="property-scene-title" className="visually-hidden">
        Seeded demo property scene
      </h2>
      <div className="property-scene-media">
        {assetFailed ? (
          <div
            className="property-scene-fallback"
            role="img"
            aria-label="Seeded demo property image unavailable. The selected property identity is unchanged."
          >
            <span>Scene image unavailable</span>
            <p>
              Property identity, accepted model facts, and project status remain
              available.
            </p>
          </div>
        ) : (
          <Image
            className="property-scene-image"
            src={PROPERTY_SCENE_ASSET.src}
            alt=""
            aria-hidden="true"
            fill
            priority
            sizes="(max-width: 760px) calc(100vw - 52px), (max-width: 1100px) 70vw, 1000px"
            unoptimized
            onError={onAssetError}
            data-property-scene-image="true"
          />
        )}
        <div className="property-scene-scrim" aria-hidden="true" />
        {/* @ah INV-SEPARATE-PROPERTY-OUTLINE */}
        <svg
          className="property-outline-layer"
          viewBox={`0 0 ${SCENE_VIEWBOX_WIDTH} ${SCENE_VIEWBOX_HEIGHT}`}
          preserveAspectRatio="xMidYMid slice"
          role="img"
          aria-labelledby="property-outline-title property-outline-description"
          data-property-outline="fixture-bound"
          data-outline-property-id={property.property_id}
          data-outline-points={outlinePoints}
        >
          <title id="property-outline-title">
            {isConfirmation
              ? "Likely demo property candidate boundary"
              : "Confirmed demo property boundary"}
          </title>
          <desc id="property-outline-description">
            {isConfirmation
              ? "A modeled boundary outlines the likely property candidate for homeowner confirmation. It is separate from the scene image and is not roof geometry."
              : "A modeled boundary retains the confirmed demo property context during roof assembly. It is separate from the scene image and roof geometry."}
          </desc>
          <polygon points={outlinePoints} vectorEffect="non-scaling-stroke" />
        </svg>
        {/* @ah INV-EVENT-GATED-SCENE-LAYERS */}
        {projection.roof_surfaces.length > 0 ? (
          <svg
            className="roof-surface-layer"
            viewBox={`0 0 ${SCENE_VIEWBOX_WIDTH} ${SCENE_VIEWBOX_HEIGHT}`}
            preserveAspectRatio="xMidYMid slice"
            role="img"
            aria-labelledby="roof-surface-title roof-surface-description"
            data-roof-surface-layer="accepted"
          >
            <title id="roof-surface-title">Modeled roof surfaces</title>
            <desc id="roof-surface-description">
              {projection.roof_surfaces.length} modeled roof surfaces accepted
              for this seeded demo property.
            </desc>
            {projection.roof_surfaces.map((surface) => (
              <polygon
                key={surface.surface_id}
                points={normalizedPoints(surface.polygon)}
                vectorEffect="non-scaling-stroke"
                data-surface-id={surface.surface_id}
                data-surface-geometry={JSON.stringify(surface.polygon)}
              />
            ))}
          </svg>
        ) : null}
        {projection.panel_objects.length > 0 ? (
          <svg
            className="panel-object-layer"
            viewBox={`0 0 ${SCENE_VIEWBOX_WIDTH} ${SCENE_VIEWBOX_HEIGHT}`}
            preserveAspectRatio="xMidYMid slice"
            role="img"
            aria-labelledby="panel-layer-title panel-layer-description"
            data-panel-object-layer="accepted"
          >
            <title id="panel-layer-title">Placed panel objects</title>
            <desc id="panel-layer-description">
              {projection.panel_objects.length} stable modeled panel objects
              placed on the accepted roof surfaces.
            </desc>
            {projection.panel_objects.map((panel) => {
              const x = panel.geometry.x * SCENE_VIEWBOX_WIDTH;
              const y = panel.geometry.y * SCENE_VIEWBOX_HEIGHT;
              const width = panel.geometry.width * SCENE_VIEWBOX_WIDTH;
              const height = panel.geometry.height * SCENE_VIEWBOX_HEIGHT;
              const centerX = x + width / 2;
              const centerY = y + height / 2;
              return (
                <g
                  key={panel.panel_id}
                  transform={`rotate(${panel.geometry.rotation_degrees} ${centerX} ${centerY})`}
                  data-panel-id={panel.panel_id}
                  data-panel-surface-id={panel.surface_id}
                  data-panel-placement-rank={panel.placement_rank}
                  data-panel-geometry={JSON.stringify(panel.geometry)}
                  data-panel-render-status={panel.render_status}
                  data-panel-selection-state={panel.selection_state}
                >
                  <rect
                    className="panel-object-shape"
                    x={x}
                    y={y}
                    width={width}
                    height={height}
                    rx="4"
                    vectorEffect="non-scaling-stroke"
                  />
                  <line
                    className="panel-object-detail"
                    x1={x + width / 2}
                    x2={x + width / 2}
                    y1={y}
                    y2={y + height}
                    vectorEffect="non-scaling-stroke"
                  />
                </g>
              );
            })}
          </svg>
        ) : null}
      </div>
    </section>
  );
}
