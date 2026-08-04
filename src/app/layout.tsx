/**
 * MODULE: src/app/layout.tsx
 * PURPOSE: Own the document shell and metadata for the credential-free foundation route.
 * PUBLIC API / ENTRYPOINTS:
 *   - RootLayout: wraps every App Router route in the repository foundation.
 * INVARIANTS:
 *   - The root shell initializes no product provider, credential, persistence, or client runtime.
 * BOUNDARIES:
 *   - Product layout and visual authority belong to later approved state specifications.
 * RELATED:
 *   - src/app/page.tsx: renders the only foundation route.
 *   - src/app/globals.css: supplies minimal native presentation.
 */
import type { Metadata } from "next";
import type { ReactNode } from "react";

import "./globals.css";

export const metadata: Metadata = {
  title: "Repository Foundation",
  description: "Application startup verification.",
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
