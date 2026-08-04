/**
 * MODULE: src/app/page.tsx
 * PURPOSE: Compose the approved S1 address-entry landing and its server-rendered runtime-readiness marker.
 * PUBLIC API / ENTRYPOINTS:
 *   - Home: Next.js root route for the seeded S1 landing.
 * INVARIANTS:
 *   - [INV-PRODUCT-RUNTIME-MARKER] Initial HTML keeps the stable S1-S2 runtime marker consumed by smoke and E2E readiness checks.
 * BOUNDARIES:
 *   - Browser storage is client-owned; final live-assembly visuals, transport, S3, pricing, and accounts remain absent.
 * RELATED:
 *   - src/project/ui/address-entry-experience.tsx: owns the S1 workflow and client runtime handoff.
 *   - src/app/project/page.tsx: supports direct same-session runtime restoration.
 *   - scripts/production-smoke.mjs: verifies this route from a production server.
 */
import { AddressEntryRoute } from "../project/ui/address-entry-experience";

export default function Home() {
  // @ah INV-PRODUCT-RUNTIME-MARKER
  return <AddressEntryRoute />;
}
