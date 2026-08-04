/**
 * MODULE: src/app/layout.tsx
 * PURPOSE: Own the document shell and truthful metadata for the credential-free seeded solar project entry.
 * PUBLIC API / ENTRYPOINTS:
 *   - RootLayout: wraps the S1 landing and browser-session project runtime routes.
 * INVARIANTS:
 *   - The root shell initializes no product provider, credential, durable persistence, or external client.
 * BOUNDARIES:
 *   - Final S2 composition and later-state metadata belong to their approved visual tasks.
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
  title: "Start Your Solar Project | Seeded Demo",
  description:
    "Start an unsaved browser-session solar project with the seeded Maple Street demo address.",
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
