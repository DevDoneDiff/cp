/**
 * MODULE: src/app/api/project/assembly/stream/route.ts
 * PURPOSE: Stream the remaining deterministic seeded assembly events over native same-origin SSE.
 * PUBLIC API / ENTRYPOINTS:
 *   - GET: validates bounded correlation and streams ordered typed event payloads at the seeded schedule.
 * INVARIANTS:
 *   - [SEC-SSE-REQUEST-GATE] Invalid, extra, duplicated, foreign, or impossible correlation values receive no event stream.
 * BOUNDARIES:
 *   - The route has no session store or domain mutation authority; output remains untrusted until client reducer acceptance.
 * RELATED:
 *   - src/project/adapters/seeded-assembly-feed.ts: owns query validation and deterministic event construction.
 *   - src/app/api/project/assembly/poll/route.ts: provides the bounded cursor fallback.
 * SECURITY:
 *   - No address, credential, cookie payload, provider call, durable write, or user-controlled log is read or emitted.
 * EVENTS:
 *   - Emits only remaining S2 modeled-work event envelopes after the accepted cursor.
 */
import {
  assemblyEventDueAtMs,
  assemblyEventIndexAfter,
  createSeededAssemblyEvent,
  parseAssemblyFeedRequest,
  SEEDED_ASSEMBLY_EVENT_COUNT,
} from "../../../../../project/adapters/seeded-assembly-feed";

export const dynamic = "force-dynamic";

function invalidRequest(): Response {
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

function isSameOriginRequest(request: Request): boolean {
  const url = new URL(request.url);
  const origin = request.headers.get("origin");
  const fetchSite = request.headers.get("sec-fetch-site");
  return (
    (origin === null || origin === url.origin) &&
    (fetchSite === null || fetchSite === "same-origin")
  );
}

// @ah SEC-SSE-REQUEST-GATE
export function GET(request: Request): Response {
  if (!isSameOriginRequest(request)) return invalidRequest();
  const parsed = parseAssemblyFeedRequest(new URL(request.url));
  if (!parsed.ok) return invalidRequest();
  const cursor = parsed.cursor;
  const encoder = new TextEncoder();
  let closed = false;
  let activeTimer: ReturnType<typeof setTimeout> | null = null;
  let removeAbortListener: () => void = () => undefined;

  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      const close = () => {
        if (closed) return;
        closed = true;
        if (activeTimer !== null) clearTimeout(activeTimer);
        removeAbortListener();
        try {
          controller.close();
        } catch {
          // A canceled client already owns closure.
        }
      };
      const onAbort = () => close();
      request.signal.addEventListener("abort", onAbort, { once: true });
      removeAbortListener = () =>
        request.signal.removeEventListener("abort", onAbort);
      controller.enqueue(encoder.encode(": seeded-assembly\n\n"));

      const enqueueIndex = (eventIndex: number) => {
        if (closed || eventIndex >= SEEDED_ASSEMBLY_EVENT_COUNT) {
          close();
          return;
        }
        const delayMs = Math.max(
          0,
          assemblyEventDueAtMs(cursor, eventIndex) - Date.now(),
        );
        activeTimer = setTimeout(() => {
          if (closed) return;
          const event = createSeededAssemblyEvent(cursor, eventIndex);
          controller.enqueue(
            encoder.encode(
              `id: ${event.cursor}\nevent: work\ndata: ${JSON.stringify(event)}\n\n`,
            ),
          );
          enqueueIndex(eventIndex + 1);
        }, delayMs);
      };

      enqueueIndex(assemblyEventIndexAfter(cursor));
    },
    cancel() {
      closed = true;
      if (activeTimer !== null) clearTimeout(activeTimer);
      removeAbortListener();
    },
  });

  return new Response(stream, {
    status: 200,
    headers: {
      "Cache-Control": "no-store, no-transform",
      Connection: "keep-alive",
      "Content-Type": "text/event-stream; charset=utf-8",
      "X-Content-Type-Options": "nosniff",
      "X-Accel-Buffering": "no",
    },
  });
}
