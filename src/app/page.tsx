/**
 * MODULE: src/app/page.tsx
 * PURPOSE: Expose a credential-free root route for startup and browser verification.
 * PUBLIC API / ENTRYPOINTS:
 *   - Home: handles the App Router GET / surface.
 * INVARIANTS:
 *   - [INV-NON-PRODUCT-SHELL] The route remains semantic, server-rendered, and free of product behavior, providers, persistence, and required hydration.
 * BOUNDARIES:
 *   - This route proves repository operation and establishes no S1-S10 appearance or copy authority.
 * RELATED:
 *   - src/app/layout.tsx: owns the surrounding document shell.
 *   - tests/component/page.test.tsx: proves semantic route behavior.
 *   - tests/e2e/smoke.spec.ts: proves production browser behavior.
 */
export default function Home() {
  // @ah INV-NON-PRODUCT-SHELL
  return (
    <main aria-labelledby="foundation-status">
      <p className="context">System check</p>
      <h1 id="foundation-status">Repository foundation ready</h1>
      <p className="status">
        The application started successfully and rendered this non-product
        verification route.
      </p>
    </main>
  );
}
