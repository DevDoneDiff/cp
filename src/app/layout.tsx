/**
 * MODULE: src/app/layout.tsx
 * PURPOSE: Own the document shell and truthful metadata for the credential-free pre-account runtime.
 * PUBLIC API / ENTRYPOINTS:
 *   - RootLayout: wraps the App Router project-runtime surface.
 * INVARIANTS:
 *   - The root shell initializes no product provider, credential, durable persistence, or external client.
 * BOUNDARIES:
 *   - Final S1-S2 composition and later product metadata belong to their approved visual tasks.
 * RELATED:
 *   - src/app/page.tsx: renders the semantic S1-S2 runtime entrypoint.
 *   - src/app/globals.css: supplies bounded temporary native presentation.
 */
import type { Metadata } from "next";
import type { ReactNode } from "react";

import "./globals.css";

export const metadata: Metadata = {
  title: "Seeded Pre-account Project Runtime",
  description: "Semantic S1-S2 session project runtime for seeded demo data.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
