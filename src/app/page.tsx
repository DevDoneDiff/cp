/**
 * MODULE: src/app/page.tsx
 * PURPOSE: Compose the root pre-account project runtime and its server-rendered availability marker.
 * PUBLIC API / ENTRYPOINTS:
 *   - Home: Next.js root route component for GET /.
 * INVARIANTS:
 *   - [INV-PRODUCT-RUNTIME-MARKER] The initial HTML exposes a stable marker for the available S1-S2 runtime contract.
 * BOUNDARIES:
 *   - Browser storage is client-owned; final visual compositions, live assembly transport, S3, pricing, and accounts are absent.
 * RELATED:
 *   - src/project/ui/pre-account-runtime.tsx: owns client restore and semantic runtime controls.
 *   - src/app/layout.tsx: supplies truthful route metadata.
 *   - scripts/production-smoke.mjs: verifies this route from a production server.
 */
import { PreAccountRuntime } from "../project/ui/pre-account-runtime";

export default function Home() {
  // @ah INV-PRODUCT-RUNTIME-MARKER
  return (
    <main
      aria-labelledby="runtime-title"
      data-product-surface="s1-s2-pre-account-runtime"
      data-runtime-contract-version="1"
    >
      <header className="runtime-header">
        <p className="eyebrow">Runtime contract proof</p>
        <h1 id="runtime-title">Pre-account project runtime</h1>
        <p>
          A semantic implementation surface for the continuous seeded S1-S2
          project environment.
        </p>
      </header>
      <PreAccountRuntime />
    </main>
  );
}
