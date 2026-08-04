import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import Home from "../../src/app/page";
import { SESSION_PROJECT_STORAGE_KEY } from "../../src/project/adapters/browser-runtime";

beforeEach(() => {
  window.sessionStorage.clear();
  vi.restoreAllMocks();
});

afterEach(() => {
  cleanup();
});

describe("pre-account runtime root route", () => {
  it("renders one accessible semantic runtime surface and a fresh S1 contract", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");

    render(<Home />);

    const main = screen.getByRole("main");
    expect(document.querySelectorAll("main")).toHaveLength(1);
    expect(within(main).getAllByRole("heading", { level: 1 })).toHaveLength(1);
    expect(
      within(main).getByRole("heading", {
        level: 1,
        name: "Pre-account project runtime",
      }),
    ).toBeVisible();
    expect(main).toHaveAttribute(
      "data-product-surface",
      "s1-s2-pre-account-runtime",
    );
    expect(
      await screen.findByRole("heading", { name: "Address entry runtime" }),
    ).toBeVisible();
    expect(screen.getByText(/no session project exists/i)).toBeVisible();
    expect(screen.queryByText(/repository foundation ready/i)).toBeNull();
    expect(
      screen.queryByText(/pricing|update system|project lenses|sign in/i),
    ).toBeNull();
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("keeps one scene node and stable identities through confirmation, work, readiness, and restore", async () => {
    const user = userEvent.setup();
    const { container, unmount } = render(<Home />);
    await screen.findByRole("heading", { name: "Address entry runtime" });

    await user.click(
      screen.getByRole("button", {
        name: "Create seeded project for 123 Maple St",
      }),
    );
    expect(
      screen.getByRole("heading", { name: "Property confirmation runtime" }),
    ).toBeVisible();
    expect(screen.getByText("Seeded demo imagery")).toBeVisible();
    expect(screen.getByText("Demo property match")).toBeVisible();
    expect(
      screen.queryByRole("button", { name: /modeled work event/i }),
    ).toBeNull();

    const sceneNode = container.querySelector(
      '[data-scene-shell="persistent"]',
    );
    expect(sceneNode).not.toBeNull();
    const sceneId = screen.getByTestId("scene-id").textContent;
    const cameraId = screen.getByTestId("camera-id").textContent;
    const propertyId = screen.getByTestId("property-id").textContent;

    await user.click(
      screen.getByRole("button", { name: "Confirm demo property" }),
    );
    expect(
      screen.getByRole("heading", { name: "Live roof assembly runtime" }),
    ).toBeVisible();
    expect(container.querySelector('[data-scene-shell="persistent"]')).toBe(
      sceneNode,
    );

    for (let step = 0; step < 7; step += 1) {
      await user.click(
        screen.getByRole("button", { name: "Apply next modeled work event" }),
      );
      expect(container.querySelector('[data-scene-shell="persistent"]')).toBe(
        sceneNode,
      );
    }

    expect(
      screen.getByText("Minimum usable property and panel model ready"),
    ).toBeVisible();
    expect(
      screen.getByText(/preliminary property and panel model is ready/i),
    ).toBeVisible();
    expect(screen.getAllByRole("listitem")).toHaveLength(4);
    const panelIds = [...container.querySelectorAll("[data-panel-id]")].map(
      (node) => node.getAttribute("data-panel-id"),
    );
    expect(new Set(panelIds).size).toBe(4);
    expect(
      screen.queryByText(/pricing|update system|project lenses|S3/i),
    ).toBeNull();

    unmount();
    const restored = render(<Home />);
    expect(
      await screen.findByText(
        "This project was restored from this browser session.",
      ),
    ).toBeVisible();
    expect(screen.getByTestId("scene-id")).toHaveTextContent(sceneId ?? "");
    expect(screen.getByTestId("camera-id")).toHaveTextContent(cameraId ?? "");
    expect(screen.getByTestId("property-id")).toHaveTextContent(
      propertyId ?? "",
    );
    expect(
      [...restored.container.querySelectorAll("[data-panel-id]")].map((node) =>
        node.getAttribute("data-panel-id"),
      ),
    ).toEqual(panelIds);
  });

  it("returns to the preserved address draft and removes candidate-derived scene state", async () => {
    const user = userEvent.setup();
    const { container } = render(<Home />);
    await screen.findByRole("heading", { name: "Address entry runtime" });
    await user.click(
      screen.getByRole("button", {
        name: "Create seeded project for 123 Maple St",
      }),
    );
    await user.click(
      screen.getByRole("button", { name: "Correct seeded address" }),
    );

    expect(
      screen.getByRole("heading", { name: "Address entry runtime" }),
    ).toBeVisible();
    expect(
      screen.getByText("Previous input preserved: 123 Maple St"),
    ).toBeVisible();
    expect(
      container.querySelector('[data-scene-shell="persistent"]'),
    ).toBeNull();
    expect(screen.queryByText("Seeded demo imagery")).toBeNull();
  });

  it("recovers corrupt or malicious storage without creating injected elements", async () => {
    window.sessionStorage.setItem(
      SESSION_PROJECT_STORAGE_KEY,
      JSON.stringify({
        schema_version: 1,
        address_draft: '<img src="https://evil.example" onerror="steal()">',
      }),
    );
    const { container } = render(<Home />);

    expect(
      await screen.findByText(/invalid session data was cleared/i),
    ).toBeVisible();
    expect(
      screen.getByRole("heading", { name: "Address entry runtime" }),
    ).toBeVisible();
    expect(container.querySelector("img")).toBeNull();
    expect(container.querySelector("a")).toBeNull();
    expect(container.innerHTML).not.toContain("evil.example");
  });
});
