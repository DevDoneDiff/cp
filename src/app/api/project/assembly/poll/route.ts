/**
 * MODULE: src/app/api/project/assembly/poll/route.ts
 * PURPOSE: Return only schedule-due seeded assembly events after a validated accepted cursor.
 * PUBLIC API / ENTRYPOINTS:
 *   - GET: exact-query cursor fallback returning a bounded JSON event batch.
 * INVARIANTS:
 *   - [SEC-POLL-REQUEST-GATE] Invalid, extra, duplicated, foreign, or impossible correlation values receive no candidate event.
 * BOUNDARIES:
 *   - Request count/duration and retry are client-controller concerns; domain acceptance remains in SessionProjectRuntime.
 * RELATED:
 *   - src/project/adapters/seeded-assembly-feed.ts: owns deterministic event slots and timing.
 *   - src/app/api/project/assembly/stream/route.ts: provides the primary SSE path.
 * SECURITY:
 *   - The response is bounded to the seven-event local feed and performs no provider or durable operation.
 * EVENTS:
 *   - Returns zero or more due modeled-work event envelopes after the supplied cursor.
 */
import {
  assemblyEventDueAtMs,
  assemblyEventIndexAfter,
  createSeededAssemblyEvent,
  parseAssemblyFeedRequest,
  SEEDED_ASSEMBLY_EVENT_COUNT,
} from "../../../../../project/adapters/seeded-assembly-feed";

export const dynamic = "force-dynamic";

function isSameOriginRequest(request: Request): boolean {
  const url = new URL(request.url);
  const origin = request.headers.get("origin");
  const fetchSite = request.headers.get("sec-fetch-site");
  return (
    (origin === null || origin === url.origin) &&
    (fetchSite === null || fetchSite === "same-origin")
  );
}

// @ah SEC-POLL-REQUEST-GATE
export function GET(request: Request): Response {
  if (!isSameOriginRequest(request)) {
    return Response.json(
      { error: "INVALID_ASSEMBLY_REQUEST" },
      {
        status: 400,
        headers: {
          "Cache-Control": "no-store",
          "X-Content-Type-Options": "nosniff",
        },
      },
    );
  }
  const parsed = parseAssemblyFeedRequest(new URL(request.url));
  if (!parsed.ok) {
    return Response.json(
      { error: "INVALID_ASSEMBLY_REQUEST" },
      {
        status: 400,
        headers: {
          "Cache-Control": "no-store",
          "X-Content-Type-Options": "nosniff",
        },
      },
    );
  }
  const cursor = parsed.cursor;
  const events = [];
  const now = Date.now();
  for (
    let eventIndex = assemblyEventIndexAfter(cursor);
    eventIndex < SEEDED_ASSEMBLY_EVENT_COUNT;
    eventIndex += 1
  ) {
    if (assemblyEventDueAtMs(cursor, eventIndex) > now) break;
    events.push(createSeededAssemblyEvent(cursor, eventIndex));
    break;
  }
  const finalCursor = cursor.confirmationCursor + SEEDED_ASSEMBLY_EVENT_COUNT;
  return Response.json(
    {
      schema_version: 1,
      fixture_version: cursor.fixtureVersion,
      after_cursor: cursor.afterCursor,
      feed_complete: cursor.afterCursor + events.length >= finalCursor,
      events,
    },
    {
      status: 200,
      headers: {
        "Cache-Control": "no-store",
        "X-Content-Type-Options": "nosniff",
      },
    },
  );
}
