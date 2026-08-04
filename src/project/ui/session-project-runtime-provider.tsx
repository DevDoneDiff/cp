/**
 * MODULE: src/project/ui/session-project-runtime-provider.tsx
 * PURPOSE: Keep one browser-session project runtime alive across S1 and project-route navigation.
 * PUBLIC API / ENTRYPOINTS:
 *   - SessionProjectRuntimeProvider: root-layout owner for the client runtime instance.
 *   - useSharedSessionProjectRuntime: reads the layout-owned runtime when a route is inside the provider.
 * INVARIANTS:
 *   - One mounted root layout creates at most one runtime and route changes cannot replace it.
 * BOUNDARIES:
 *   - The provider owns instance lifetime only; runtime commands, validation, persistence, and events remain downstream authorities.
 * RELATED:
 *   - src/app/layout.tsx: mounts the provider across App Router page transitions.
 *   - src/project/ui/address-entry-experience.tsx: consumes the shared instance when present.
 *   - src/project/application/session-project-runtime.ts: owns authoritative project behavior.
 * DATA:
 *   - No project data is copied into context; consumers receive only the runtime object.
 */
"use client";

import { createContext, type ReactNode, useContext, useState } from "react";
import { createBrowserSessionProjectRuntime } from "../adapters/browser-runtime";
import type { SessionProjectRuntime } from "../application/session-project-runtime";

const SessionProjectRuntimeContext =
  createContext<SessionProjectRuntime | null>(null);

export function SessionProjectRuntimeProvider({
  children,
}: Readonly<{ children: ReactNode }>) {
  const [runtime] = useState(createBrowserSessionProjectRuntime);

  return (
    <SessionProjectRuntimeContext.Provider value={runtime}>
      {children}
    </SessionProjectRuntimeContext.Provider>
  );
}

export function useSharedSessionProjectRuntime(): SessionProjectRuntime | null {
  return useContext(SessionProjectRuntimeContext);
}
