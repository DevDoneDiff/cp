/**
 * MODULE: src/app/project/page.tsx
 * PURPOSE: Provide the client-navigated and directly restorable entrypoint for the browser-session project runtime.
 * PUBLIC API / ENTRYPOINTS:
 *   - ProjectPage: Next.js route component for GET /project.
 * INVARIANTS:
 *   - Only a projection accepted by the existing runtime restore boundary can reveal S2 state.
 * BOUNDARIES:
 *   - The route creates no project, performs no durable write, and cannot bypass validated confirmation or work-event authority.
 * RELATED:
 *   - src/project/ui/address-entry-experience.tsx: restores valid state or remains safely in S1.
 *   - src/project/ui/pre-account-runtime.tsx: renders the existing semantic persistent runtime.
 */
import { AddressEntryRoute } from "../../project/ui/address-entry-experience";

export default function ProjectPage() {
  return <AddressEntryRoute directProjectEntry />;
}
