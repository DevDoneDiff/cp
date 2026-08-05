/**
 * MODULE: src/app/layout.tsx
 * PURPOSE: Own the document shell and truthful metadata for the credential-free seeded solar project entry.
 * PUBLIC API / ENTRYPOINTS:
 *   - RootLayout: wraps the S1 landing and browser-session project runtime routes.
 * INVARIANTS:
 *   - The root shell initializes only the local runtime-lifetime provider, with no credential, durable persistence, or external client.
 * BOUNDARIES:
 *   - Metadata covers only the seeded S1-S2 slice; accounts, pricing, providers, and later product states remain absent.
 * RELATED:
 *   - src/app/page.tsx: renders the approved seeded address entrypoint.
 *   - src/app/globals.css: supplies the approved S1 native presentation.
 *   - src/project/ui/session-project-runtime-provider.tsx: preserves one runtime across route transitions.
 */
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { SessionProjectRuntimeProvider } from "../project/ui/session-project-runtime-provider";

import "./globals.css";

export const metadata: Metadata = {
  title: "Seeded Property Analysis | Solar Project",
  description:
    "Start an unsaved browser-session solar project, confirm the seeded Maple Street property, and watch its modeled roof assemble.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <SessionProjectRuntimeProvider>
          {children}
        </SessionProjectRuntimeProvider>
      </body>
    </html>
  );
}
