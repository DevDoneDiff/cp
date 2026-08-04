/**
 * MODULE: src/project/ui/address-entry-experience.tsx
 * PURPOSE: Render and coordinate the complete seeded S1 address-entry experience before the persistent runtime.
 * PUBLIC API / ENTRYPOINTS:
 *   - AddressEntryExperience: injectable S1 workflow used by tests and route composition.
 *   - AddressEntryRoute: App Router-aware production entrypoint for root and direct runtime routes.
 * CONTROL_FLOW:
 *   1. Restore and validate the browser-session projection before enabling address authority.
 *   2. Keep input, suggestion, help, loading, error, and sign-in feedback transient.
 *   3. Dispatch one canonical address command, then navigate only after atomic runtime persistence succeeds.
 * INVARIANTS:
 *   - One synchronous in-flight latch prevents pointer, keyboard, retry, or submit races from creating duplicate projects.
 *   - Help and deferred-sign-in interactions cannot create project, identity, credential, cookie, or network state.
 * BOUNDARIES:
 *   - Project creation, event authority, projection validation, and sessionStorage remain owned by SessionProjectRuntime.
 * RELATED:
 *   - src/project/adapters/seeded-address-lookup.ts: supplies local asynchronous lookup behavior.
 *   - src/project/application/session-project-runtime.ts: accepts and atomically persists the canonical command.
 *   - src/project/ui/pre-account-runtime.tsx: renders the existing semantic S2 runtime after navigation.
 * SECURITY:
 *   - Raw address input is never written to a URL, log, cookie, localStorage, or external request.
 * DATA:
 *   - S1 view state is transient; only a successfully accepted runtime projection reaches sessionStorage.
 * EVENTS:
 *   - Successful selection may dispatch RESOLVE_SEEDED_ADDRESS once; all other S1 interactions are non-consequential.
 */
"use client";

import { useRouter } from "next/navigation";
import {
  type FormEvent,
  type KeyboardEvent,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import { createBrowserSessionProjectRuntime } from "../adapters/browser-runtime";
import {
  LocalSeededAddressLookup,
  type SeededAddressLookup,
  type SeededAddressSuggestion,
  suggestSeededAddress,
} from "../adapters/seeded-address-lookup";
import { SessionProjectRuntime } from "../application/session-project-runtime";
import { PreAccountRuntime } from "./pre-account-runtime";
import { useSharedSessionProjectRuntime } from "./session-project-runtime-provider";

const SIGN_IN_MESSAGE =
  "Sign-in is not available in this pre-account demo. Enter an address to begin.";

const HELP_STEPS = [
  {
    title: "Enter the demo address",
    copy: "Choose 123 Maple St to start one unsaved browser-session project.",
  },
  {
    title: "Confirm the likely property",
    copy: "Review the seeded property match before any deeper model work begins.",
  },
  {
    title: "Watch the starting model assemble",
    copy: "Roof facts and stable panel objects appear only as modeled work is accepted.",
  },
  {
    title: "Keep one project context",
    copy: "The same project stays with you when the starting demo model is ready.",
  },
] as const;

type Feedback =
  | { kind: "invalid"; message: string }
  | { kind: "lookup_error"; message: string }
  | null;

export interface AddressEntryExperienceProps {
  runtime?: SessionProjectRuntime;
  lookup?: SeededAddressLookup;
  onNavigate: (href: string) => void;
  directProjectEntry?: boolean;
}

function SolarMark() {
  return (
    <span className="solar-mark" aria-hidden="true">
      <span className="solar-mark-core" />
      <span className="solar-mark-rays" />
    </span>
  );
}

function ArrowIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 32 32">
      <path d="M5 16h20M18 8l8 8-8 8" />
    </svg>
  );
}

function LocationIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <path d="M12 21s6-5.4 6-12a6 6 0 1 0-12 0c0 6.6 6 12 6 12Z" />
      <circle cx="12" cy="9" r="2" />
    </svg>
  );
}

export function AddressEntryExperience({
  runtime,
  lookup,
  onNavigate,
  directProjectEntry = false,
}: AddressEntryExperienceProps) {
  const [activeRuntime] = useState(
    () => runtime ?? createBrowserSessionProjectRuntime(),
  );
  const [activeLookup] = useState(
    () => lookup ?? new LocalSeededAddressLookup(),
  );
  const [snapshot, setSnapshot] = useState(activeRuntime.getSnapshot);
  const [address, setAddress] = useState(
    () => activeRuntime.getSnapshot().projection?.address_draft ?? "",
  );
  const [suggestion, setSuggestion] = useState<SeededAddressSuggestion | null>(
    null,
  );
  const [suggestionOpen, setSuggestionOpen] = useState(false);
  const [suggestionHighlighted, setSuggestionHighlighted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [retryInput, setRetryInput] = useState<string | null>(null);
  const [helpOpen, setHelpOpen] = useState(false);
  const [signInFeedback, setSignInFeedback] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const helpTriggerRef = useRef<HTMLButtonElement>(null);
  const helpCloseRef = useRef<HTMLButtonElement>(null);
  const pendingRef = useRef(false);
  const mountedRef = useRef(true);
  const inputId = useId();
  const listboxId = `${inputId}-suggestions`;
  const optionId = `${inputId}-maple-option`;
  const feedbackId = `${inputId}-feedback`;
  const restoreReady = snapshot.restore_status !== "not_checked";

  useEffect(() => {
    mountedRef.current = true;
    const synchronize = () => {
      const next = activeRuntime.getSnapshot();
      setSnapshot(next);
      if (
        next.projection?.visible_state === "ADDRESS_ENTRY" &&
        next.projection.property === null &&
        next.error_code === null
      ) {
        pendingRef.current = false;
        setLoading(false);
        setFeedback(null);
        setRetryInput(null);
        const preservedDraft = next.projection.address_draft;
        setAddress(preservedDraft);
        setSuggestion(suggestSeededAddress(preservedDraft));
        requestAnimationFrame(() => inputRef.current?.focus());
      }
    };
    const unsubscribe = activeRuntime.subscribe(synchronize);
    if (activeRuntime.getSnapshot().restore_status === "not_checked") {
      activeRuntime.dispatch({ type: "RESTORE_SESSION" });
    } else {
      synchronize();
    }
    return () => {
      mountedRef.current = false;
      unsubscribe();
    };
  }, [activeRuntime]);

  const closeHelp = useCallback(() => {
    setHelpOpen(false);
    requestAnimationFrame(() => helpTriggerRef.current?.focus());
  }, []);

  useEffect(() => {
    if (!helpOpen) return;
    helpCloseRef.current?.focus();
    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeHelp();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [closeHelp, helpOpen]);

  const showInvalid = useCallback((message: string) => {
    pendingRef.current = false;
    setLoading(false);
    setFeedback({ kind: "invalid", message });
    requestAnimationFrame(() => inputRef.current?.focus());
  }, []);

  const beginLookup = useCallback(
    async (commandInput: string) => {
      if (!restoreReady || pendingRef.current) return;
      pendingRef.current = true;
      setHelpOpen(false);
      setRetryInput(commandInput);
      setAddress(commandInput);
      setSuggestionOpen(false);
      setSuggestionHighlighted(false);
      setFeedback(null);
      setLoading(true);

      const lookupResult = await activeLookup.resolve(commandInput);
      if (!mountedRef.current) return;

      if (lookupResult.kind === "recoverable_failure") {
        pendingRef.current = false;
        setLoading(false);
        setFeedback({
          kind: "lookup_error",
          message:
            "The seeded demo lookup failed. Your address is still here, and no project was created.",
        });
        return;
      }
      if (lookupResult.kind === "unsupported") {
        showInvalid(
          "That address is not available in this demo. Use 123 Maple St, Austin, TX 78704.",
        );
        return;
      }

      const result = activeRuntime.dispatch({
        type: "RESOLVE_SEEDED_ADDRESS",
        input: lookupResult.command_input,
      });
      const accepted = activeRuntime.getSnapshot();
      if (
        !result.ok ||
        accepted.projection?.property === null ||
        accepted.visible_state !== "PROPERTY_CONFIRMATION"
      ) {
        pendingRef.current = false;
        setLoading(false);
        if (!result.ok && result.error_code === "ADDRESS_NOT_SUPPORTED") {
          showInvalid(
            "That address is not available in this demo. Use 123 Maple St, Austin, TX 78704.",
          );
        } else {
          setFeedback({
            kind: "lookup_error",
            message:
              "The project could not be saved in this browser session. Your address is still here. Try again.",
          });
        }
        return;
      }

      setLoading(false);
      onNavigate("/project");
    },
    [activeLookup, activeRuntime, onNavigate, restoreReady, showInvalid],
  );

  const submitAddress = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (pendingRef.current) return;
    if (address.trim().length === 0) {
      showInvalid(
        "Enter the seeded demo address: 123 Maple St, Austin, TX 78704.",
      );
      return;
    }
    const nextSuggestion = suggestion ?? suggestSeededAddress(address);
    if (nextSuggestion === null) {
      showInvalid(
        "That address is not available in this demo. Use 123 Maple St, Austin, TX 78704.",
      );
      return;
    }
    void beginLookup(nextSuggestion.command_input);
  };

  const onAddressKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      if (suggestion !== null && !loading) {
        event.preventDefault();
        setSuggestionOpen(true);
        setSuggestionHighlighted(true);
      }
      return;
    }
    if (event.key === "Enter" && suggestionOpen && suggestionHighlighted) {
      event.preventDefault();
      if (suggestion !== null) void beginLookup(suggestion.command_input);
      return;
    }
    if (event.key === "Escape" && suggestionOpen) {
      event.preventDefault();
      setSuggestionOpen(false);
      setSuggestionHighlighted(false);
    }
  };

  if (snapshot.projection?.property != null) {
    return (
      <main
        className="runtime-page"
        data-product-surface="s1-s2-pre-account-runtime"
        data-runtime-contract-version="1"
      >
        <PreAccountRuntime runtime={activeRuntime} onNavigate={onNavigate} />
      </main>
    );
  }

  return (
    <main
      className="s1-page"
      data-product-surface="s1-s2-pre-account-runtime"
      data-runtime-contract-version="1"
    >
      <div className="s1-frame">
        <div className="s1-atmosphere" aria-hidden="true" />
        <header className="s1-header">
          <div className="wordmark" aria-label="Solar project platform">
            <SolarMark />
            <span>SOLAR</span>
          </div>
          <button
            ref={helpTriggerRef}
            type="button"
            className="help-trigger"
            aria-expanded={helpOpen}
            aria-controls="how-it-works"
            onClick={() => {
              setSuggestionOpen(false);
              setHelpOpen(true);
            }}
          >
            <span className="help-trigger-icon" aria-hidden="true">
              ?
            </span>
            How it works
          </button>
        </header>

        <section className="s1-hero" aria-labelledby="s1-title">
          <h1 id="s1-title">
            <span>Build your solar</span> <span>project with</span>{" "}
            <em>confidence.</em>
          </h1>
          <p className="s1-intro">
            Start with one seeded demo address. Review the likely property
            before any model work begins.
          </p>

          {snapshot.restore_status === "recovered_invalid" ? (
            <p className="s1-recovery" role="status">
              Invalid browser-session data was cleared. A fresh address entry is
              ready.
            </p>
          ) : directProjectEntry &&
            snapshot.restore_status === "empty" &&
            snapshot.projection === null ? (
            <p className="s1-recovery" role="status">
              No active browser-session project was found. Start again with the
              seeded demo address.
            </p>
          ) : null}

          <form
            className="address-form"
            onSubmit={submitAddress}
            aria-busy={loading}
          >
            <label htmlFor={inputId}>Home address</label>
            <div className="address-control">
              <span className="address-location-icon">
                <LocationIcon />
              </span>
              <input
                ref={inputRef}
                id={inputId}
                name="address"
                type="text"
                autoComplete="street-address"
                maxLength={240}
                placeholder="Enter 123 Maple St"
                value={address}
                readOnly={loading}
                disabled={!restoreReady}
                role="combobox"
                aria-autocomplete="list"
                aria-expanded={suggestionOpen && suggestion !== null}
                aria-controls={listboxId}
                aria-activedescendant={
                  suggestionOpen && suggestionHighlighted ? optionId : undefined
                }
                aria-invalid={feedback?.kind === "invalid" ? "true" : undefined}
                aria-errormessage={feedback ? feedbackId : undefined}
                onFocus={() => {
                  if (suggestion !== null && !loading) setSuggestionOpen(true);
                }}
                onBlur={() => setSuggestionOpen(false)}
                onKeyDown={onAddressKeyDown}
                onChange={(event) => {
                  const nextAddress = event.target.value;
                  const nextSuggestion = suggestSeededAddress(nextAddress);
                  setAddress(nextAddress);
                  setSuggestion(nextSuggestion);
                  setSuggestionOpen(nextSuggestion !== null);
                  setSuggestionHighlighted(false);
                  setFeedback(null);
                  setRetryInput(null);
                }}
              />
              <button
                className="address-submit"
                type="submit"
                disabled={!restoreReady || loading}
                aria-label={
                  loading ? "Checking demo address" : "Find demo property"
                }
              >
                {loading ? <span className="loading-dot" /> : <ArrowIcon />}
              </button>
            </div>

            <div className="address-result-slot">
              {suggestionOpen && suggestion !== null && !loading ? (
                <ul
                  id={listboxId}
                  className="address-suggestions"
                  role="listbox"
                  aria-label="Seeded demo address suggestions"
                >
                  <li
                    id={optionId}
                    role="option"
                    aria-selected={suggestionHighlighted}
                    className={suggestionHighlighted ? "is-highlighted" : ""}
                    onPointerDown={(event) => {
                      event.preventDefault();
                      void beginLookup(suggestion.command_input);
                    }}
                    onClick={() => {
                      void beginLookup(suggestion.command_input);
                    }}
                    onPointerMove={() => setSuggestionHighlighted(true)}
                  >
                    <span>
                      <strong>{suggestion.street_line}</strong>
                      <small>{suggestion.locality_line}</small>
                    </span>
                    <span className="seeded-label">Seeded demo</span>
                  </li>
                </ul>
              ) : null}

              {loading ? (
                <p className="lookup-status" role="status">
                  Checking the seeded demo address...
                </p>
              ) : null}

              {feedback ? (
                <div id={feedbackId} className="address-feedback" role="alert">
                  <p>{feedback.message}</p>
                  {feedback.kind === "lookup_error" && retryInput ? (
                    <button
                      type="button"
                      className="retry-button"
                      onClick={() => {
                        void beginLookup(retryInput);
                      }}
                    >
                      Retry demo lookup
                    </button>
                  ) : null}
                </div>
              ) : null}
            </div>
          </form>

          <div className="entry-support">
            <button
              type="button"
              className="deferred-sign-in"
              onClick={() => setSignInFeedback(true)}
            >
              <span aria-hidden="true">&#x2192;</span>
              Sign in
            </button>
            <p>No phone number required. No contractor contact.</p>
          </div>
          {signInFeedback ? (
            <p className="sign-in-feedback" role="status">
              {SIGN_IN_MESSAGE}
            </p>
          ) : null}
        </section>

        <section
          className="trust-rail"
          aria-label="Privacy and project promises"
        >
          <ul>
            <li>
              <span className="trust-index" aria-hidden="true">
                01
              </span>
              <span>
                <strong>Nothing is sold.</strong> We do not sell or share your
                information.
              </span>
            </li>
            <li>
              <span className="trust-index" aria-hidden="true">
                02
              </span>
              <span>
                <strong>No lead blast.</strong> No contractor receives this
                project.
              </span>
            </li>
            <li>
              <span className="trust-index" aria-hidden="true">
                03
              </span>
              <span>
                <strong>Session only.</strong> The unsaved demo stays in this
                browser session.
              </span>
            </li>
            <li>
              <span className="trust-index" aria-hidden="true">
                04
              </span>
              <span>
                <strong>You decide.</strong> Project authority remains with you.
              </span>
            </li>
          </ul>
        </section>

        {helpOpen ? (
          <section
            id="how-it-works"
            className="help-panel"
            role="dialog"
            aria-labelledby="how-it-works-title"
            aria-describedby="how-it-works-intro"
          >
            <div className="help-panel-heading">
              <div>
                <p className="help-eyebrow">Your project. Your pace.</p>
                <h2 id="how-it-works-title">How it works</h2>
              </div>
              <button
                ref={helpCloseRef}
                type="button"
                className="help-close"
                aria-label="Close how it works"
                onClick={closeHelp}
              >
                <span aria-hidden="true">&#x00D7;</span>
              </button>
            </div>
            <p id="how-it-works-intro" className="help-intro">
              Four clear steps through the approved pre-account demo slice.
            </p>
            <ol className="help-steps">
              {HELP_STEPS.map((step, index) => (
                <li key={step.title}>
                  <span className="help-step-number" aria-hidden="true">
                    {index + 1}
                  </span>
                  <span>
                    <strong>{step.title}</strong>
                    <small>{step.copy}</small>
                  </span>
                </li>
              ))}
            </ol>
            <p className="help-footer">
              No spam. No pressure. Session-only demo.
            </p>
          </section>
        ) : null}
      </div>
    </main>
  );
}

export interface AddressEntryRouteProps {
  directProjectEntry?: boolean;
}

export function AddressEntryRoute({
  directProjectEntry = false,
}: AddressEntryRouteProps) {
  const router = useRouter();
  const sharedRuntime = useSharedSessionProjectRuntime();
  const runtimeProps = sharedRuntime === null ? {} : { runtime: sharedRuntime };
  return (
    <AddressEntryExperience
      {...runtimeProps}
      directProjectEntry={directProjectEntry}
      onNavigate={(href) => {
        router.push(href);
      }}
    />
  );
}
