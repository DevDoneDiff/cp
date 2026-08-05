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
 *   - The scene renders accepted projection objects only and applies one fixed camera-display projection without mutating canonical event or projection geometry.
 * RELATED:
 *   - src/project/ui/pre-account-runtime.tsx: keeps this component in one stable JSX position and owns asset-failure view state.
 *   - src/project/domain/model.ts: defines stable candidate, scene, and normalized fixture geometry contracts.
 *   - src/project/adapters/seeded-demo.ts: supplies the trusted local candidate outline.
 */
import Image from "next/image";

import { SEEDED_DEMO_FIXTURE } from "../adapters/seeded-demo";
import type {
  PanelGeometry,
  PanelObject,
  RoofSurface,
  SessionProjectProjection,
} from "../domain/model";

const SCENE_VIEWBOX_WIDTH = 1000;
const SCENE_VIEWBOX_HEIGHT = 667;

const SEEDED_CAMERA_SURFACE_POLYGONS: Readonly<
  Record<string, readonly { x: number; y: number }[]>
> = {
  "south-main": [
    { x: 0.27, y: 0.43 },
    { x: 0.51, y: 0.3 },
    { x: 0.72, y: 0.43 },
    { x: 0.54, y: 0.6 },
  ],
  "west-wing": [
    { x: 0.29, y: 0.53 },
    { x: 0.38, y: 0.47 },
    { x: 0.43, y: 0.54 },
    { x: 0.34, y: 0.63 },
  ],
};

const SEEDED_CAMERA_PANEL_GEOMETRY: Readonly<Record<string, PanelGeometry>> = {
  "panel-south-01": {
    x: 0.38,
    y: 0.39,
    width: 0.05,
    height: 0.1,
    rotation_degrees: -1,
  },
  "panel-south-02": {
    x: 0.445,
    y: 0.375,
    width: 0.05,
    height: 0.1,
    rotation_degrees: 2,
  },
  "panel-south-03": {
    x: 0.51,
    y: 0.365,
    width: 0.05,
    height: 0.1,
    rotation_degrees: 6,
  },
  "panel-west-01": {
    x: 0.335,
    y: 0.515,
    width: 0.045,
    height: 0.085,
    rotation_degrees: -8,
  },
};

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

function usesSeededCameraProjection(
  projection: SessionProjectProjection,
): boolean {
  return (
    projection.scene?.fixture_scene_key ===
      SEEDED_DEMO_FIXTURE.scene.fixture_scene_key &&
    projection.scene.fixture_camera_key ===
      SEEDED_DEMO_FIXTURE.scene.fixture_camera_key
  );
}

function sceneSurfacePolygon(
  projection: SessionProjectProjection,
  surface: RoofSurface,
): readonly { x: number; y: number }[] {
  return usesSeededCameraProjection(projection)
    ? (SEEDED_CAMERA_SURFACE_POLYGONS[surface.fixture_surface_key] ??
        surface.polygon)
    : surface.polygon;
}

function scenePanelGeometry(
  projection: SessionProjectProjection,
  panel: PanelObject,
): PanelGeometry {
  return usesSeededCameraProjection(projection)
    ? (SEEDED_CAMERA_PANEL_GEOMETRY[panel.fixture_panel_key] ?? panel.geometry)
    : panel.geometry;
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
                points={normalizedPoints(
                  sceneSurfacePolygon(projection, surface),
                )}
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
              const displayGeometry = scenePanelGeometry(projection, panel);
              const x = displayGeometry.x * SCENE_VIEWBOX_WIDTH;
              const y = displayGeometry.y * SCENE_VIEWBOX_HEIGHT;
              const width = displayGeometry.width * SCENE_VIEWBOX_WIDTH;
              const height = displayGeometry.height * SCENE_VIEWBOX_HEIGHT;
              const centerX = x + width / 2;
              const centerY = y + height / 2;
              return (
                <g
                  key={panel.panel_id}
                  transform={`rotate(${displayGeometry.rotation_degrees} ${centerX} ${centerY})`}
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
