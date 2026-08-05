import { describe, expect, it } from "vitest";

import { GET as pollAssembly } from "../../src/app/api/project/assembly/poll/route";
import { GET as streamAssembly } from "../../src/app/api/project/assembly/stream/route";
import { assemblyFeedCursorFromProjection } from "../../src/project/application/live-roof-assembly";
import type { AssemblyFeedCursor } from "../../src/project/application/live-roof-assembly";
import {
  confirmProject,
  createRuntimeHarness,
  startProject,
} from "../helpers/project-runtime";

function routeUrl(path: string, cursor: AssemblyFeedCursor): string {
  const url = new URL(path, "http://localhost");
  url.search = new URLSearchParams({
    fixture_version: cursor.fixtureVersion,
    session_project_id: cursor.sessionProjectId,
    property_id: cursor.propertyId,
    candidate_ordinal: String(cursor.candidateOrdinal),
    confirmation_cursor: String(cursor.confirmationCursor),
    confirmation_occurred_at: cursor.confirmationOccurredAt,
    after_cursor: String(cursor.afterCursor),
    project_version: String(cursor.projectVersion),
  }).toString();
  return url.toString();
}

function confirmedCursor() {
  const harness = createRuntimeHarness();
  startProject(harness.runtime);
  const confirmed = confirmProject(harness.runtime);
  const cursor = assemblyFeedCursorFromProjection(confirmed);
  if (cursor === null) throw new Error("ASSEMBLY_CURSOR_MISSING");
  return { ...harness, confirmed, cursor };
}

describe("same-origin assembly routes", () => {
  it("returns one due polling event after the supplied cursor with no-store security headers", async () => {
    const { cursor } = confirmedCursor();
    const response = pollAssembly(
      new Request(routeUrl("/api/project/assembly/poll", cursor)),
    );
    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(response.headers.get("x-content-type-options")).toBe("nosniff");
    const payload = (await response.json()) as {
      after_cursor: number;
      feed_complete: boolean;
      events: Array<{ cursor: number; type: string }>;
    };
    expect(payload).toMatchObject({
      after_cursor: cursor.afterCursor,
      feed_complete: false,
    });
    expect(payload.events).toEqual([
      expect.objectContaining({
        cursor: cursor.afterCursor + 1,
        type: "ROOF_GEOMETRY_READY",
      }),
    ]);
  });

  it("streams the remaining ordered work events as named SSE messages", async () => {
    const { cursor } = confirmedCursor();
    const response = streamAssembly(
      new Request(routeUrl("/api/project/assembly/stream", cursor)),
    );
    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toContain("text/event-stream");
    expect(response.headers.get("cache-control")).toBe(
      "no-store, no-transform",
    );
    const body = await response.text();
    expect(body.match(/^event: work$/gm)).toHaveLength(7);
    expect(body.match(/^id: \d+$/gm)).toHaveLength(7);
    expect(body).toContain('"type":"ROOF_GEOMETRY_READY"');
    expect(body).toContain('"type":"MINIMUM_USABLE_READY"');
  });

  it("rejects cross-site, duplicate, extra, and foreign route correlation without events", async () => {
    const { cursor } = confirmedCursor();
    const crossSite = pollAssembly(
      new Request(routeUrl("/api/project/assembly/poll", cursor), {
        headers: { "Sec-Fetch-Site": "cross-site" },
      }),
    );
    expect(crossSite.status).toBe(400);
    expect(crossSite.headers.get("x-content-type-options")).toBe("nosniff");

    const crossOriginStream = streamAssembly(
      new Request(routeUrl("/api/project/assembly/stream", cursor), {
        headers: { Origin: "https://cross-origin.example" },
      }),
    );
    expect(crossOriginStream.status).toBe(400);
    expect(crossOriginStream.headers.get("x-content-type-options")).toBe(
      "nosniff",
    );

    const invalidUrls = [
      `${routeUrl("/api/project/assembly/poll", cursor)}&after_cursor=${cursor.afterCursor}`,
      `${routeUrl("/api/project/assembly/poll", cursor)}&extra=true`,
      routeUrl("/api/project/assembly/poll", {
        ...cursor,
        propertyId: "foreign-property",
      }),
    ];
    for (const url of invalidUrls) {
      const response = pollAssembly(new Request(url));
      expect(response.status).toBe(400);
      expect(await response.json()).toEqual({
        error: "INVALID_ASSEMBLY_REQUEST",
      });
    }
  });
});
