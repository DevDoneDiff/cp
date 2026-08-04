import { expect, type Page, test } from "@playwright/test";

import { SESSION_PROJECT_STORAGE_KEY } from "../../src/project/adapters/browser-runtime";

const APP_ORIGIN = "http://127.0.0.1:3100";
const SIGN_IN_MESSAGE =
  "Sign-in is not available in this pre-account demo. Enter an address to begin.";

interface BrowserObservations {
  browserErrors: string[];
  httpErrors: string[];
  externalRequests: string[];
  requests: string[];
}

function observe(page: Page): BrowserObservations {
  const observations: BrowserObservations = {
    browserErrors: [],
    httpErrors: [],
    externalRequests: [],
    requests: [],
  };
  page.on("pageerror", (error) =>
    observations.browserErrors.push(error.message),
  );
  page.on("console", (message) => {
    if (message.type() === "error") {
      observations.browserErrors.push(message.text());
    }
  });
  page.on("response", (response) => {
    if (response.status() >= 400) {
      observations.httpErrors.push(`${response.status()} ${response.url()}`);
    }
  });
  page.on("request", (request) => {
    observations.requests.push(request.url());
    try {
      if (new URL(request.url()).origin !== APP_ORIGIN) {
        observations.externalRequests.push(request.url());
      }
    } catch {
      observations.externalRequests.push(request.url());
    }
  });
  return observations;
}

async function expectNoHorizontalOverflow(page: Page): Promise<void> {
  const overflow = await page.evaluate(() => ({
    document:
      document.documentElement.scrollWidth -
      document.documentElement.clientWidth,
    body: document.body.scrollWidth - document.body.clientWidth,
  }));
  expect(overflow.document).toBeLessThanOrEqual(0);
  expect(overflow.body).toBeLessThanOrEqual(0);
}

async function readStoredProjection(page: Page) {
  return page.evaluate((key) => {
    const serialized = window.sessionStorage.getItem(key);
    return serialized
      ? (JSON.parse(serialized) as Record<string, unknown>)
      : null;
  }, SESSION_PROJECT_STORAGE_KEY);
}

async function enterAddressWithKeyboard(page: Page): Promise<void> {
  const input = page.getByRole("combobox", { name: "Home address" });
  await input.fill("123 Maple St");
  await expect(page.getByRole("option")).toBeVisible();
  await input.press("ArrowDown");
  await input.press("Enter");
}

test("keyboard entry completes the real S1 workflow through one client runtime transition", async ({
  page,
  context,
}) => {
  const observations = observe(page);
  await page.setViewportSize({ width: 1536, height: 1024 });
  await page.addInitScript(() => {
    Object.defineProperty(window, "__cpDocumentToken", {
      configurable: false,
      value: globalThis.crypto.randomUUID(),
      writable: false,
    });
  });

  const response = await page.goto("/");
  expect(response?.status()).toBe(200);
  await expect(page.locator("main")).toHaveCount(1);
  await expect(page.locator("main")).toHaveAttribute(
    "data-product-surface",
    "s1-s2-pre-account-runtime",
  );
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Build your solar project with confidence.",
  );
  const input = page.getByRole("combobox", { name: "Home address" });
  await expect(input).toBeEnabled();
  await expect(page.getByText(/no phone number required/i)).toBeVisible();
  await expect(
    page.getByText(/no contractor receives this project/i),
  ).toBeVisible();
  await expect(page.getByText(/do not sell or share/i)).toBeVisible();
  await expect(
    page.getByText(/unsaved demo stays in this browser session/i),
  ).toBeVisible();
  await expect(
    page.getByText(
      /project estimate in seconds|reviews|rating|Nearmap|Google/i,
    ),
  ).toHaveCount(0);
  const documentToken = await page.evaluate(
    () => (window as Window & { __cpDocumentToken?: string }).__cpDocumentToken,
  );

  const helpTrigger = page.getByRole("button", { name: "How it works" });
  await helpTrigger.click();
  const help = page.getByRole("dialog", { name: "How it works" });
  await expect(help).toBeVisible();
  await expect(help.getByRole("listitem")).toHaveCount(4);
  const closeHelp = help.getByRole("button", { name: "Close how it works" });
  await expect(closeHelp).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(help).toHaveCount(0);
  await expect(helpTrigger).toBeFocused();

  const requestCountBeforeSignIn = observations.requests.length;
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(
    page.getByRole("status").filter({ hasText: SIGN_IN_MESSAGE }),
  ).toBeVisible();
  expect(observations.requests).toHaveLength(requestCountBeforeSignIn);
  expect(await context.cookies()).toEqual([]);
  expect(
    await page.evaluate(() => ({
      local: window.localStorage.length,
      session: window.sessionStorage.length,
    })),
  ).toEqual({ local: 0, session: 0 });

  await page.getByRole("button", { name: "Find demo property" }).click();
  await expect(
    page
      .getByRole("alert")
      .filter({ hasText: "Enter the seeded demo address" }),
  ).toContainText("Enter the seeded demo address");
  await input.fill("456 Oak Ave");
  await page.getByRole("button", { name: "Find demo property" }).click();
  await expect(
    page
      .getByRole("alert")
      .filter({ hasText: "123 Maple St, Austin, TX 78704" }),
  ).toContainText("123 Maple St, Austin, TX 78704");
  await expect(input).toHaveValue("456 Oak Ave");
  expect(await readStoredProjection(page)).toBeNull();

  await enterAddressWithKeyboard(page);
  await expect(
    page
      .getByRole("status")
      .filter({ hasText: "Checking the seeded demo address" }),
  ).toContainText("Checking the seeded demo address");
  await expect(input).toHaveAttribute("readonly", "");
  await expect(
    page.getByRole("button", { name: "Checking demo address" }),
  ).toBeDisabled();
  await input.evaluate((node) => {
    const form = node.closest("form");
    form?.dispatchEvent(
      new Event("submit", { bubbles: true, cancelable: true }),
    );
    form?.dispatchEvent(
      new Event("submit", { bubbles: true, cancelable: true }),
    );
    node.dispatchEvent(
      new KeyboardEvent("keydown", {
        bubbles: true,
        cancelable: true,
        key: "Enter",
      }),
    );
  });

  const runtimeHeading = page.getByRole("heading", {
    level: 1,
    name: "Property confirmation runtime",
  });
  await expect(runtimeHeading).toBeVisible();
  await expect(runtimeHeading).toBeFocused();
  await expect(page).toHaveURL(`${APP_ORIGIN}/project`);
  expect(
    await page.evaluate(
      () =>
        (window as Window & { __cpDocumentToken?: string }).__cpDocumentToken,
    ),
  ).toBe(documentToken);

  const projection = await readStoredProjection(page);
  expect(projection).toMatchObject({
    schema_version: 1,
    fixture_version: "seeded-maple-austin-v1",
    project_version: 1,
    visible_state: "PROPERTY_CONFIRMATION",
    source_kind: "SEEDED_DEMO_IMAGERY",
    certainty_kind: "DEMO_PROPERTY_MATCH",
    latest_cursor: 1,
  });
  expect(projection?.events).toHaveLength(1);
  expect((projection?.events as Array<{ type: string }>)[0]?.type).toBe(
    "ADDRESS_RESOLVED",
  );
  expect(typeof projection?.session_project_id).toBe("string");
  expect(
    (projection?.property as { property_id?: string }).property_id,
  ).toBeTruthy();
  expect((projection?.scene as { scene_id?: string }).scene_id).toBeTruthy();
  expect((projection?.scene as { camera_id?: string }).camera_id).toBeTruthy();

  await expectNoHorizontalOverflow(page);
  expect(observations.browserErrors).toEqual([]);
  expect(observations.httpErrors).toEqual([]);
  expect(observations.externalRequests).toEqual([]);
});

test("pointer selection preserves the persistent scene and stable objects through readiness and reload", async ({
  page,
}) => {
  const observations = observe(page);
  await page.goto("/");
  const input = page.getByRole("combobox", { name: "Home address" });
  await expect(input).toBeEnabled();
  await input.fill("123 Maple");
  await page.getByRole("option").click();
  await expect(
    page.getByRole("heading", { name: "Property confirmation runtime" }),
  ).toBeVisible();

  const scene = page.locator('[data-scene-shell="persistent"]');
  await expect(scene).toHaveCount(1);
  await scene.evaluate((node) => {
    (node as HTMLElement & { __continuityToken?: string }).__continuityToken =
      "same-scene-node";
  });
  const sceneId = await page.getByTestId("scene-id").textContent();
  const cameraId = await page.getByTestId("camera-id").textContent();
  const propertyId = await page.getByTestId("property-id").textContent();

  await page.getByRole("button", { name: "Confirm demo property" }).click();
  await expect(
    page.getByRole("heading", { name: "Live roof assembly runtime" }),
  ).toBeFocused();
  expect(
    await scene.evaluate(
      (node) =>
        (node as HTMLElement & { __continuityToken?: string })
          .__continuityToken,
    ),
  ).toBe("same-scene-node");

  for (let step = 0; step < 7; step += 1) {
    await page
      .getByRole("button", { name: "Apply next modeled work event" })
      .click();
  }
  await expect(
    page.getByText("Minimum usable property and panel model ready"),
  ).toBeVisible();
  await expect(page.locator("[data-panel-id]")).toHaveCount(4);
  const panelIds = await page
    .locator("[data-panel-id]")
    .evaluateAll((nodes) =>
      nodes.map((node) => node.getAttribute("data-panel-id")),
    );
  expect(new Set(panelIds).size).toBe(4);
  await expect(
    page.getByText(/pricing|update system|project lenses/i),
  ).toHaveCount(0);

  await page.reload();
  await expect(
    page.getByText("This project was restored from this browser session."),
  ).toBeVisible();
  await expect(page.getByTestId("scene-id")).toHaveText(sceneId ?? "");
  await expect(page.getByTestId("camera-id")).toHaveText(cameraId ?? "");
  await expect(page.getByTestId("property-id")).toHaveText(propertyId ?? "");
  expect(
    await page
      .locator("[data-panel-id]")
      .evaluateAll((nodes) =>
        nodes.map((node) => node.getAttribute("data-panel-id")),
      ),
  ).toEqual(panelIds);
  expect(observations.browserErrors).toEqual([]);
  expect(observations.httpErrors).toEqual([]);
  expect(observations.externalRequests).toEqual([]);
});

test("a thrown seeded lookup is recoverable, preserves input, and retries without false project state", async ({
  page,
}) => {
  const observations = observe(page);
  await page.goto("/");
  const input = page.getByRole("combobox", { name: "Home address" });
  await expect(input).toBeEnabled();
  await input.fill("123 Maple St");
  await expect(page.getByRole("option")).toBeVisible();

  await page.evaluate(() => {
    const original = String.prototype.toLocaleLowerCase;
    String.prototype.toLocaleLowerCase = function patched(locales) {
      if (String(this) === "123 Maple St, Austin, TX 78704") {
        String.prototype.toLocaleLowerCase = original;
        throw new Error("INJECTED_ONE_SHOT_SEEDED_LOOKUP_FAILURE");
      }
      return original.call(this, locales);
    };
  });
  await page.getByRole("option").click();
  await expect(
    page
      .getByRole("alert")
      .filter({ hasText: "The seeded demo lookup failed" }),
  ).toContainText("The seeded demo lookup failed");
  await expect(input).toHaveValue("123 Maple St, Austin, TX 78704");
  expect(await readStoredProjection(page)).toBeNull();

  await page.getByRole("button", { name: "Retry demo lookup" }).click();
  await expect(
    page.getByRole("heading", { name: "Property confirmation runtime" }),
  ).toBeVisible();
  const projection = await readStoredProjection(page);
  expect(projection?.events).toHaveLength(1);
  expect(observations.browserErrors).toEqual([]);
  expect(observations.httpErrors).toEqual([]);
  expect(observations.externalRequests).toEqual([]);
});

test("an unavailable first session write stays in S1 and succeeds atomically on retry", async ({
  page,
}) => {
  await page.addInitScript((key) => {
    const original = Storage.prototype.setItem;
    let failOnce = true;
    Storage.prototype.setItem = function patched(storageKey, value) {
      if (failOnce && storageKey === key) {
        failOnce = false;
        throw new DOMException(
          "Injected session write failure",
          "QuotaExceededError",
        );
      }
      return original.call(this, storageKey, value);
    };
  }, SESSION_PROJECT_STORAGE_KEY);
  await page.goto("/");
  const input = page.getByRole("combobox", { name: "Home address" });
  await expect(input).toBeEnabled();
  await input.fill("123 Maple St");
  await page.getByRole("option").click();
  await expect(
    page
      .getByRole("alert")
      .filter({ hasText: "could not be saved in this browser session" }),
  ).toContainText("could not be saved in this browser session");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Build your solar project with confidence.",
  );
  expect(await readStoredProjection(page)).toBeNull();

  await page.getByRole("button", { name: "Retry demo lookup" }).click();
  await expect(
    page.getByRole("heading", { name: "Property confirmation runtime" }),
  ).toBeVisible();
  const projection = await readStoredProjection(page);
  expect(projection?.events).toHaveLength(1);
  expect(projection?.project_version).toBe(1);
});

for (const viewport of [
  { width: 1536, height: 1024 },
  { width: 1440, height: 900 },
  { width: 1024, height: 768 },
  { width: 390, height: 844 },
]) {
  test(`default and open help remain readable without overflow at ${viewport.width}x${viewport.height}`, async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.setViewportSize(viewport);
    await page.goto("/");
    await expect(
      page.getByRole("heading", { level: 1, name: /Build your solar project/ }),
    ).toBeVisible();
    const input = page.getByRole("combobox", { name: "Home address" });
    const submit = page.getByRole("button", { name: "Find demo property" });
    const helpTrigger = page.getByRole("button", { name: "How it works" });
    await expect(input).toBeEnabled();
    await expectNoHorizontalOverflow(page);

    for (const control of [input, submit, helpTrigger]) {
      const box = await control.boundingBox();
      expect(box).not.toBeNull();
      expect(box?.height ?? 0).toBeGreaterThanOrEqual(44);
      expect((box?.x ?? -1) + (box?.width ?? 0)).toBeLessThanOrEqual(
        viewport.width,
      );
    }

    await helpTrigger.click();
    const panel = page.getByRole("dialog", { name: "How it works" });
    await expect(panel).toBeVisible();
    await expect(panel.getByRole("listitem")).toHaveCount(4);
    const panelBox = await panel.boundingBox();
    expect(panelBox).not.toBeNull();
    expect(panelBox?.x ?? -1).toBeGreaterThanOrEqual(0);
    expect((panelBox?.x ?? 0) + (panelBox?.width ?? 0)).toBeLessThanOrEqual(
      viewport.width,
    );
    expect(panelBox?.y ?? -1).toBeGreaterThanOrEqual(0);
    expect((panelBox?.y ?? 0) + (panelBox?.height ?? 0)).toBeLessThanOrEqual(
      viewport.height,
    );
    expect(
      await panel.evaluate((node) => ({
        animationDuration: getComputedStyle(node).animationDuration,
        transform: getComputedStyle(node).transform,
      })),
    ).toMatchObject({ transform: "none" });
    await expectNoHorizontalOverflow(page);
  });
}

test("a new browser context begins at fresh S1 without another context's session project", async ({
  browser,
}) => {
  const firstContext = await browser.newContext({ baseURL: APP_ORIGIN });
  const firstPage = await firstContext.newPage();
  await firstPage.goto("/");
  await enterAddressWithKeyboard(firstPage);
  await expect(
    firstPage.getByRole("heading", { name: "Property confirmation runtime" }),
  ).toBeVisible();

  const freshContext = await browser.newContext({ baseURL: APP_ORIGIN });
  const freshPage = await freshContext.newPage();
  await freshPage.goto("/");
  await expect(
    freshPage.getByRole("heading", {
      level: 1,
      name: /Build your solar project/,
    }),
  ).toBeVisible();
  await expect(
    freshPage.getByRole("combobox", { name: "Home address" }),
  ).toBeEnabled();
  expect(await readStoredProjection(freshPage)).toBeNull();

  await firstContext.close();
  await freshContext.close();
});

test("direct project entry without a session projection returns to S1 with recovery guidance", async ({
  page,
}) => {
  const observations = observe(page);
  await page.goto("/project");
  await expect(
    page.getByRole("status").filter({
      hasText: "No active browser-session project was found",
    }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", {
      level: 1,
      name: "Build your solar project with confidence.",
    }),
  ).toBeVisible();
  expect(await readStoredProjection(page)).toBeNull();
  expect(observations.browserErrors).toEqual([]);
  expect(observations.httpErrors).toEqual([]);
  expect(observations.externalRequests).toEqual([]);
});

test("malicious session data recovers to fresh S1 without script or URL injection", async ({
  page,
}) => {
  const observations = observe(page);
  await page.addInitScript(
    ({ key, serialized }) => window.sessionStorage.setItem(key, serialized),
    {
      key: SESSION_PROJECT_STORAGE_KEY,
      serialized: JSON.stringify({
        schema_version: 1,
        source_kind: "GOOGLE_VERIFIED",
        address_draft:
          '<img src="https://evil.example" onerror="window.pwned=true">',
      }),
    },
  );

  await page.goto("/");
  await expect(
    page.getByText(/invalid browser-session data was cleared/i),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { level: 1, name: /Build your solar project/ }),
  ).toBeVisible();
  await expect(page.locator('img[src*="evil.example"]')).toHaveCount(0);
  await expect(page.locator('a[href*="evil.example"]')).toHaveCount(0);
  expect(await page.evaluate(() => "pwned" in window)).toBe(false);
  expect(await readStoredProjection(page)).toBeNull();
  expect(observations.browserErrors).toEqual([]);
  expect(observations.externalRequests).toEqual([]);
});
