import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const navigation = vi.hoisted(() => ({ push: vi.fn() }));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: navigation.push }),
}));

import Home from "../../src/app/page";
import { SESSION_PROJECT_STORAGE_KEY } from "../../src/project/adapters/browser-runtime";
import type {
  SeededAddressLookup,
  SeededAddressLookupResult,
} from "../../src/project/adapters/seeded-address-lookup";
import { AddressEntryExperience } from "../../src/project/ui/address-entry-experience";
import { createRuntimeHarness, startProject } from "../helpers/project-runtime";

class ImmediateLookup implements SeededAddressLookup {
  calls: string[] = [];

  async resolve(input: string): Promise<SeededAddressLookupResult> {
    this.calls.push(input);
    return { kind: "resolved", command_input: input };
  }
}

class DeferredLookup implements SeededAddressLookup {
  calls: string[] = [];
  private completeAttempt?: (result: SeededAddressLookupResult) => void;

  resolve(input: string): Promise<SeededAddressLookupResult> {
    this.calls.push(input);
    return new Promise((resolve) => {
      this.completeAttempt = resolve;
    });
  }

  complete(result: SeededAddressLookupResult): void {
    this.completeAttempt?.(result);
  }
}

class SequenceLookup implements SeededAddressLookup {
  calls: string[] = [];

  constructor(private readonly results: SeededAddressLookupResult[]) {}

  async resolve(input: string): Promise<SeededAddressLookupResult> {
    this.calls.push(input);
    return this.results.shift() ?? { kind: "recoverable_failure" };
  }
}

async function readyAddressInput(): Promise<HTMLInputElement> {
  const input = screen.getByRole("combobox", {
    name: "Home address",
  }) as HTMLInputElement;
  await waitFor(() => expect(input).toBeEnabled());
  return input;
}

beforeEach(() => {
  window.sessionStorage.clear();
  window.localStorage.clear();
  window.history.replaceState({}, "", "/");
  navigation.push.mockReset();
  vi.restoreAllMocks();
});

afterEach(() => {
  cleanup();
});

describe("S1 address-entry experience", () => {
  it("renders one truthful accessible landing with no project or external request", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");

    render(<Home />);
    const input = await readyAddressInput();
    const main = screen.getByRole("main");

    expect(document.querySelectorAll("main")).toHaveLength(1);
    expect(within(main).getAllByRole("heading", { level: 1 })).toHaveLength(1);
    expect(within(main).getByRole("heading", { level: 1 })).toHaveTextContent(
      "Build your solar project with confidence.",
    );
    expect(main).toHaveAttribute(
      "data-product-surface",
      "s1-s2-pre-account-runtime",
    );
    expect(input).toHaveAttribute("aria-autocomplete", "list");
    expect(
      screen.getByRole("button", { name: "Find demo property" }),
    ).toBeVisible();
    expect(screen.getByRole("button", { name: "How it works" })).toBeVisible();
    expect(screen.getByText(/no phone number required/i)).toBeVisible();
    expect(
      screen.getByText(/no contractor receives this project/i),
    ).toBeVisible();
    expect(screen.getByText(/do not sell or share/i)).toBeVisible();
    expect(
      screen.getByText(/unsaved demo stays in this browser session/i),
    ).toBeVisible();
    expect(screen.queryByText(/pre-account project runtime/i)).toBeNull();
    expect(
      screen.queryByText(/rating|reviews|nearby contractor|price estimate/i),
    ).toBeNull();
    expect(
      window.sessionStorage.getItem(SESSION_PROJECT_STORAGE_KEY),
    ).toBeNull();
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("returns a direct project route without a projection to S1 with bounded recovery guidance", async () => {
    const { runtime } = createRuntimeHarness();

    render(
      <AddressEntryExperience
        directProjectEntry
        runtime={runtime}
        lookup={new ImmediateLookup()}
        onNavigate={vi.fn()}
      />,
    );

    await readyAddressInput();
    expect(screen.getByRole("status")).toHaveTextContent(
      "No active browser-session project was found",
    );
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      "Build your solar project with confidence.",
    );
    expect(runtime.getSnapshot().projection).toBeNull();
  });

  it("opens and closes the four-row help surface with focus return and keeps sign-in deferred", async () => {
    const user = userEvent.setup();
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    const initialUrl = window.location.href;

    render(<Home />);
    await readyAddressInput();
    const helpTrigger = screen.getByRole("button", { name: "How it works" });
    await user.click(helpTrigger);

    const dialog = screen.getByRole("dialog", { name: "How it works" });
    expect(within(dialog).getAllByRole("listitem")).toHaveLength(4);
    expect(within(dialog).getByText("Enter the demo address")).toBeVisible();
    expect(
      within(dialog).getByText("Confirm the likely property"),
    ).toBeVisible();
    expect(
      within(dialog).getByText("Watch the starting model assemble"),
    ).toBeVisible();
    expect(within(dialog).getByText("Keep one project context")).toBeVisible();
    const close = within(dialog).getByRole("button", {
      name: "Close how it works",
    });
    expect(close).toHaveFocus();

    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog", { name: "How it works" })).toBeNull();
    await waitFor(() => expect(helpTrigger).toHaveFocus());

    await user.click(helpTrigger);
    await user.click(
      screen.getByRole("button", { name: "Close how it works" }),
    );
    await waitFor(() => expect(helpTrigger).toHaveFocus());

    const signIn = screen.getByRole("button", { name: "Sign in" });
    await user.click(signIn);
    expect(
      screen.getByRole("status", {
        name: "",
      }),
    ).toHaveTextContent(
      "Sign-in is not available in this pre-account demo. Enter an address to begin.",
    );
    signIn.focus();
    await user.keyboard("{Enter}");
    expect(window.location.href).toBe(initialUrl);
    expect(window.sessionStorage.length).toBe(0);
    expect(window.localStorage.length).toBe(0);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("preserves invalid input and exposes one accessible seeded listbox without Tab submission", async () => {
    const user = userEvent.setup();
    const { runtime, storage } = createRuntimeHarness();
    render(
      <AddressEntryExperience
        runtime={runtime}
        lookup={new ImmediateLookup()}
        onNavigate={vi.fn()}
      />,
    );
    const input = await readyAddressInput();
    const submit = screen.getByRole("button", { name: "Find demo property" });

    await user.click(submit);
    expect(screen.getByRole("alert")).toHaveTextContent(
      "Enter the seeded demo address",
    );
    expect(input).toHaveValue("");

    await user.type(input, "456 Oak Ave");
    await user.click(submit);
    expect(screen.getByRole("alert")).toHaveTextContent(
      "123 Maple St, Austin, TX 78704",
    );
    expect(input).toHaveValue("456 Oak Ave");
    expect(runtime.getSnapshot().projection).toBeNull();
    expect(storage.writes).toBe(0);

    await user.clear(input);
    await user.type(input, "123 Maple");
    const listbox = screen.getByRole("listbox", {
      name: "Seeded demo address suggestions",
    });
    const option = within(listbox).getByRole("option");
    expect(input).toHaveAttribute("aria-expanded", "true");
    expect(option).toHaveTextContent("123 Maple St");
    expect(option).toHaveTextContent("Austin, TX 78704");

    await user.keyboard("{ArrowDown}");
    expect(option).toHaveAttribute("aria-selected", "true");
    expect(input).toHaveAttribute("aria-activedescendant", option.id);
    await user.keyboard("{ArrowUp}");
    expect(option).toHaveAttribute("aria-selected", "true");
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("listbox")).toBeNull();
    expect(input).toHaveValue("123 Maple");
    await user.tab();
    expect(submit).toHaveFocus();
    expect(runtime.getSnapshot().projection).toBeNull();
    expect(storage.writes).toBe(0);
  });

  it("uses a loading latch so rapid keyboard and submit activation create exactly one project", async () => {
    const user = userEvent.setup();
    const lookup = new DeferredLookup();
    const navigate = vi.fn();
    const { runtime, identity, storage } = createRuntimeHarness();
    render(
      <AddressEntryExperience
        runtime={runtime}
        lookup={lookup}
        onNavigate={navigate}
      />,
    );
    const input = await readyAddressInput();

    await user.type(input, "123 Maple St");
    await user.keyboard("{ArrowDown}{Enter}");
    expect(screen.getByRole("status")).toHaveTextContent(
      "Checking the seeded demo address",
    );
    expect(input).toHaveValue("123 Maple St, Austin, TX 78704");
    expect(input).toHaveAttribute("readonly");
    expect(
      screen.getByRole("button", { name: "Checking demo address" }),
    ).toBeDisabled();

    const form = input.closest("form");
    expect(form).not.toBeNull();
    fireEvent.submit(form as HTMLFormElement);
    fireEvent.keyDown(input, { key: "Enter" });
    expect(lookup.calls).toHaveLength(1);

    await act(async () => {
      lookup.complete({
        kind: "resolved",
        command_input: "123 Maple St, Austin, TX 78704",
      });
    });

    const runtimeHeading = await screen.findByRole("heading", {
      level: 1,
      name: "Is this your property?",
    });
    await waitFor(() => expect(runtimeHeading).toHaveFocus());
    expect(
      screen.queryByText(
        "This project was restored from this browser session.",
      ),
    ).toBeNull();
    expect(navigate).toHaveBeenCalledTimes(1);
    expect(navigate).toHaveBeenCalledWith("/project");
    expect(identity.projectCount).toBe(1);
    expect(storage.writes).toBe(1);
    const projection = runtime.getSnapshot().projection;
    expect(projection?.events).toHaveLength(1);
    expect(projection?.events[0]?.type).toBe("ADDRESS_RESOLVED");
    expect(projection?.source_kind).toBe("SEEDED_DEMO_IMAGERY");
    expect(projection?.certainty_kind).toBe("DEMO_PROPERTY_MATCH");
    expect(projection?.project_version).toBe(1);
    expect(projection?.latest_cursor).toBe(1);
  });

  it("clears the submission latch after correction and reselects within the same project runtime", async () => {
    const user = userEvent.setup();
    const navigate = vi.fn();
    const { runtime, identity, storage } = createRuntimeHarness();
    render(
      <AddressEntryExperience
        runtime={runtime}
        lookup={new ImmediateLookup()}
        onNavigate={navigate}
      />,
    );
    let input = await readyAddressInput();
    await user.click(screen.getByRole("button", { name: "How it works" }));
    expect(screen.getByRole("dialog", { name: "How it works" })).toBeVisible();
    await user.click(input);
    await user.type(input, "123 Maple St");
    await user.click(screen.getByRole("option"));
    await screen.findByRole("heading", {
      name: "Is this your property?",
    });
    expect(screen.queryByRole("dialog", { name: "How it works" })).toBeNull();
    const firstProjection = runtime.getSnapshot().projection;
    const firstProjectId = firstProjection?.session_project_id;
    const firstPropertyId = firstProjection?.property?.property_id;

    await user.click(
      screen.getByRole("button", { name: "Not your property?" }),
    );
    input = await readyAddressInput();
    await waitFor(() => expect(input).toHaveFocus());
    expect(input).toHaveValue("123 Maple St, Austin, TX 78704");
    expect(runtime.getSnapshot().visible_state).toBe("ADDRESS_ENTRY");
    expect(runtime.getSnapshot().projection?.property).toBeNull();
    expect(screen.queryByRole("dialog", { name: "How it works" })).toBeNull();

    storage.setError = true;
    await user.clear(input);
    await user.type(input, "123 Maple");
    await user.click(screen.getByRole("option"));
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "could not be saved in this browser session",
    );
    expect(
      screen.getByRole("button", { name: "Retry demo lookup" }),
    ).toBeVisible();
    expect(runtime.getSnapshot().projection?.session_project_id).toBe(
      firstProjectId,
    );
    expect(runtime.getSnapshot().projection?.property).toBeNull();

    storage.setError = false;
    await user.click(screen.getByRole("button", { name: "Retry demo lookup" }));
    await screen.findByRole("heading", {
      name: "Is this your property?",
    });

    const secondProjection = runtime.getSnapshot().projection;
    expect(secondProjection?.session_project_id).toBe(firstProjectId);
    expect(secondProjection?.property?.property_id).not.toBe(firstPropertyId);
    expect(secondProjection?.events.map((event) => event.type)).toEqual([
      "ADDRESS_RESOLVED",
      "PROJECT_MUTATED",
      "ADDRESS_RESOLVED",
    ]);
    expect(identity.projectCount).toBe(1);
    expect(storage.writes).toBe(3);
    expect(navigate.mock.calls).toEqual([["/project"], ["/"], ["/project"]]);
  });

  it("preserves the selected address through a recoverable lookup failure and succeeds once on retry", async () => {
    const user = userEvent.setup();
    const lookup = new SequenceLookup([
      { kind: "recoverable_failure" },
      {
        kind: "resolved",
        command_input: "123 Maple St, Austin, TX 78704",
      },
    ]);
    const { runtime, identity, storage } = createRuntimeHarness();
    render(
      <AddressEntryExperience
        runtime={runtime}
        lookup={lookup}
        onNavigate={vi.fn()}
      />,
    );
    const input = await readyAddressInput();
    await user.type(input, "123 Maple");
    await user.click(screen.getByRole("option"));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "seeded demo lookup failed",
    );
    expect(input).toHaveValue("123 Maple St, Austin, TX 78704");
    expect(runtime.getSnapshot().projection).toBeNull();
    expect(identity.projectCount).toBe(0);
    expect(storage.writes).toBe(0);

    await user.click(screen.getByRole("button", { name: "Retry demo lookup" }));
    expect(
      await screen.findByRole("heading", {
        name: "Is this your property?",
      }),
    ).toBeVisible();
    expect(lookup.calls).toHaveLength(2);
    expect(identity.projectCount).toBe(1);
    expect(storage.writes).toBe(1);
  });

  it("keeps S1 active when atomic storage fails and retries without a duplicate project root", async () => {
    const user = userEvent.setup();
    const { runtime, identity, storage } = createRuntimeHarness();
    storage.setError = true;
    render(
      <AddressEntryExperience
        runtime={runtime}
        lookup={new ImmediateLookup()}
        onNavigate={vi.fn()}
      />,
    );
    const input = await readyAddressInput();
    await user.type(input, "123 Maple St");
    await user.click(screen.getByRole("option"));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "could not be saved in this browser session",
    );
    expect(runtime.getSnapshot().projection).toBeNull();
    expect(identity.projectCount).toBe(1);
    expect(storage.writes).toBe(0);

    storage.setError = false;
    await user.click(screen.getByRole("button", { name: "Retry demo lookup" }));
    expect(
      await screen.findByRole("heading", {
        name: "Is this your property?",
      }),
    ).toBeVisible();
    expect(identity.projectCount).toBe(2);
    expect(runtime.getSnapshot().projection?.events).toHaveLength(1);
    expect(storage.writes).toBe(1);
  });

  it("renders the truthful confirmation composition and preserves the scene through the sole confirmation authority", async () => {
    const user = userEvent.setup();
    const { runtime, storage } = createRuntimeHarness();
    const rendered = render(
      <AddressEntryExperience
        runtime={runtime}
        lookup={new ImmediateLookup()}
        onNavigate={vi.fn()}
      />,
    );
    const input = await readyAddressInput();
    await user.type(input, "123 Maple St");
    await user.click(screen.getByRole("option"));
    const heading = await screen.findByRole("heading", {
      level: 1,
      name: "Is this your property?",
    });
    expect(heading).toHaveFocus();

    const sceneNode = rendered.container.querySelector(
      '[data-scene-shell="persistent"]',
    );
    expect(sceneNode).not.toBeNull();
    const sceneId = sceneNode?.getAttribute("data-scene-id");
    const cameraId = sceneNode?.getAttribute("data-camera-id");
    const propertyId = sceneNode?.getAttribute("data-property-id");
    const sceneImage = rendered.container.querySelector(
      "[data-property-scene-image]",
    );
    const propertyOutline = rendered.container.querySelector(
      "[data-property-outline]",
    );
    expect(sceneImage).not.toBeNull();
    expect(propertyOutline).not.toBeNull();
    expect(propertyOutline).toHaveAttribute(
      "data-outline-property-id",
      propertyId,
    );
    expect(propertyOutline?.getAttribute("data-outline-points")).toMatch(
      /^\d+,\d+( \d+,\d+){5}$/,
    );
    expect(
      screen.getByRole("img", {
        name: /likely demo property candidate boundary/i,
      }),
    ).toBeVisible();
    expect(
      screen.getByRole("button", { name: "Yes, this is my property" }),
    ).toBeVisible();
    expect(
      screen.getByRole("button", { name: "Not your property?" }),
    ).toBeVisible();
    expect(screen.getAllByText("Seeded demo imagery").length).toBeGreaterThan(
      0,
    );
    expect(screen.getByText("Demo property match")).toBeVisible();
    expect(screen.getByText("Modeled")).toBeVisible();
    expect(screen.getByText("Pending confirmation")).toBeVisible();
    expect(
      screen.getByText(/no contractor receives this project/i),
    ).toBeVisible();
    expect(
      screen.queryByText(
        /Nearmap|Google|May 2025|address verified|verified|high confidence|reviews|rating/i,
      ),
    ).toBeNull();
    expect(rendered.container.querySelectorAll("[data-panel-id]")).toHaveLength(
      0,
    );

    storage.setError = true;
    await user.click(
      screen.getByRole("button", { name: "Yes, this is my property" }),
    );
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "existing project is unchanged",
    );
    expect(runtime.getSnapshot().visible_state).toBe("PROPERTY_CONFIRMATION");
    expect(
      rendered.container.querySelector('[data-scene-shell="persistent"]'),
    ).toBe(sceneNode);
    storage.setError = false;
    await user.click(
      screen.getByRole("button", { name: "Yes, this is my property" }),
    );
    const confirmedHeading = await screen.findByRole("heading", {
      level: 1,
      name: "Property confirmed.",
    });
    await waitFor(() => expect(confirmedHeading).toHaveFocus());
    expect(
      rendered.container.querySelector('[data-scene-shell="persistent"]'),
    ).toBe(sceneNode);
    expect(
      rendered.container.querySelector("[data-property-scene-image]"),
    ).toBe(sceneImage);
    expect(rendered.container.querySelector("[data-property-outline]")).toBe(
      propertyOutline,
    );
    expect(sceneNode).toHaveAttribute("data-scene-id", sceneId);
    expect(sceneNode).toHaveAttribute("data-camera-id", cameraId);
    expect(sceneNode).toHaveAttribute("data-property-id", propertyId);

    const confirmed = runtime.getSnapshot().projection;
    expect(confirmed?.visible_state).toBe("LIVE_ROOF_ASSEMBLY");
    expect(confirmed?.project_version).toBe(2);
    expect(confirmed?.latest_cursor).toBe(2);
    expect(confirmed?.events.map((event) => event.type)).toEqual([
      "ADDRESS_RESOLVED",
      "PROPERTY_CONFIRMED",
    ]);
    expect(confirmed?.roof_surfaces).toEqual([]);
    expect(confirmed?.roof_facts).toBeNull();
    expect(confirmed?.panel_objects).toEqual([]);
    expect(confirmed?.energy_model).toBeNull();
    expect(confirmed?.minimum_usable_ready).toBe(false);
    expect(
      screen.getByText("Roof analysis is pending and has not started yet."),
    ).toBeVisible();
    expect(screen.queryByRole("button")).toBeNull();
    expect(screen.queryByText(/apply next|progress|energy model/i)).toBeNull();
    expect(
      screen.queryByText(/pricing|update system|project lenses/i),
    ).toBeNull();
  });

  it("restores a valid direct confirmation entry with identical candidate identities and no rewrite", async () => {
    const seededHarness = createRuntimeHarness();
    const confirmation = startProject(seededHarness.runtime);
    const writesBeforeRestore = seededHarness.storage.writes;
    const restoredHarness = createRuntimeHarness({
      storage: seededHarness.storage,
    });
    const rendered = render(
      <AddressEntryExperience
        runtime={restoredHarness.runtime}
        lookup={new ImmediateLookup()}
        onNavigate={vi.fn()}
        directProjectEntry
      />,
    );
    expect(
      await screen.findByRole("heading", {
        level: 1,
        name: "Is this your property?",
      }),
    ).toBeVisible();
    expect(
      await screen.findByText(
        "This project was restored from this browser session.",
      ),
    ).toBeVisible();
    const scene = rendered.container.querySelector(
      '[data-scene-shell="persistent"]',
    );
    expect(scene).toHaveAttribute(
      "data-scene-id",
      confirmation.scene?.scene_id,
    );
    expect(scene).toHaveAttribute(
      "data-camera-id",
      confirmation.scene?.camera_id,
    );
    expect(scene).toHaveAttribute(
      "data-property-id",
      confirmation.property?.property_id,
    );
    expect(scene).toHaveAttribute(
      "data-scene-asset-src",
      "/images/s2-property-scene.png",
    );
    expect(seededHarness.storage.writes).toBe(writesBeforeRestore);
  });

  it("keeps candidate identity, source labels, confirmation, and correction available when the scene asset fails", async () => {
    const user = userEvent.setup();
    const navigate = vi.fn();
    const { runtime } = createRuntimeHarness();
    const confirmation = startProject(runtime);
    const rendered = render(
      <AddressEntryExperience
        runtime={runtime}
        lookup={new ImmediateLookup()}
        onNavigate={navigate}
      />,
    );
    await screen.findByRole("heading", { name: "Is this your property?" });
    const scene = rendered.container.querySelector(
      '[data-scene-shell="persistent"]',
    );
    const image = rendered.container.querySelector(
      "[data-property-scene-image]",
    );
    expect(image).not.toBeNull();
    fireEvent.error(image as HTMLImageElement);

    expect(
      await screen.findByRole("img", {
        name: /property image unavailable.*identity is unchanged/i,
      }),
    ).toBeVisible();
    expect(
      screen
        .getAllByRole("status")
        .some((status) =>
          status.textContent?.includes(
            "Seeded demo property image unavailable. Property identity and details remain unchanged.",
          ),
        ),
    ).toBe(true);
    expect(screen.getByText("Scene image unavailable")).toBeVisible();
    expect(scene).toHaveAttribute(
      "data-property-id",
      confirmation.property?.property_id,
    );
    expect(scene).toHaveAttribute(
      "data-scene-id",
      confirmation.scene?.scene_id,
    );
    expect(screen.getByText("Demo property match")).toBeVisible();
    expect(screen.getByText("Modeled")).toBeVisible();
    expect(
      screen.getByRole("button", { name: "Yes, this is my property" }),
    ).toBeVisible();
    await user.click(
      screen.getByRole("button", { name: "Not your property?" }),
    );
    const input = await readyAddressInput();
    await waitFor(() => expect(input).toHaveFocus());
    expect(input).toHaveValue("123 Maple St");
    expect(runtime.getSnapshot().projection?.property).toBeNull();
    expect(navigate).toHaveBeenCalledWith("/");
  });

  it("recovers malicious session data without interpolating its markup or URL", async () => {
    window.sessionStorage.setItem(
      SESSION_PROJECT_STORAGE_KEY,
      JSON.stringify({
        schema_version: 1,
        address_draft: '<img src="https://evil.example" onerror="steal()">',
      }),
    );
    const { container } = render(<Home />);

    expect(
      await screen.findByText(/invalid browser-session data was cleared/i),
    ).toBeVisible();
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      "Build your solar project with confidence.",
    );
    expect(container.querySelector('img[src*="evil.example"]')).toBeNull();
    expect(container.querySelector('a[href*="evil.example"]')).toBeNull();
    expect(container.innerHTML).not.toContain("evil.example");
    expect(
      window.sessionStorage.getItem(SESSION_PROJECT_STORAGE_KEY),
    ).toBeNull();
  });
});
