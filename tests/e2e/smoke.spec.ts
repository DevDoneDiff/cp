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
    name: "Is this your property?",
  });
  await expect(runtimeHeading).toBeVisible();
  await expect(runtimeHeading).toBeFocused();
  await expect(page).toHaveURL(`${APP_ORIGIN}/project`);
  await expect(
    page.getByText("This project was restored from this browser session."),
  ).toHaveCount(0);
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
  expect(projection).toMatchObject({
    roof_surfaces: [],
    roof_facts: null,
    panel_objects: [],
    energy_model: null,
    minimum_usable_ready: false,
  });
  await expect(
    page.getByRole("button", { name: "Yes, this is my property" }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Not your property?" }),
  ).toBeVisible();
  await expect(page.getByText("Demo property match")).toBeVisible();
  await expect(page.getByText("Modeled", { exact: true })).toBeVisible();
  await expect(page.locator("[data-property-outline]")).toHaveAttribute(
    "data-outline-property-id",
    /.+/,
  );

  await expectNoHorizontalOverflow(page);
  expect(observations.browserErrors).toEqual([]);
  expect(observations.httpErrors).toEqual([]);
  expect(observations.externalRequests).toEqual([]);
});

test("explicit confirmation preserves the document, scene, asset, outline, and identities without starting work", async ({
  page,
}) => {
  const observations = observe(page);
  await page.goto("/");
  const input = page.getByRole("combobox", { name: "Home address" });
  await expect(input).toBeEnabled();
  await input.fill("123 Maple");
  await page.getByRole("option").click();
  await expect(
    page.getByRole("heading", { name: "Is this your property?" }),
  ).toBeVisible();

  const scene = page.locator('[data-scene-shell="persistent"]');
  await expect(scene).toHaveCount(1);
  await scene.evaluate((node) => {
    (node as HTMLElement & { __continuityToken?: string }).__continuityToken =
      "same-scene-node";
  });
  const identities = await scene.evaluate((node) => ({
    assetId: node.getAttribute("data-scene-asset-id"),
    assetSrc: node.getAttribute("data-scene-asset-src"),
    cameraId: node.getAttribute("data-camera-id"),
    propertyId: node.getAttribute("data-property-id"),
    sceneId: node.getAttribute("data-scene-id"),
  }));
  const sceneImage = scene.locator("[data-property-scene-image]");
  const outline = scene.locator("[data-property-outline]");
  const imageSrc = await sceneImage.getAttribute("src");
  const outlinePoints = await outline.getAttribute("data-outline-points");
  const requestCountBeforeConfirmation = observations.requests.length;

  await page.getByRole("button", { name: "Yes, this is my property" }).click();
  await expect(
    page.getByRole("heading", { name: "Property confirmed." }),
  ).toBeFocused();
  expect(
    await scene.evaluate(
      (node) =>
        (node as HTMLElement & { __continuityToken?: string })
          .__continuityToken,
    ),
  ).toBe("same-scene-node");
  await expect(scene).toHaveAttribute(
    "data-scene-id",
    identities.sceneId ?? "",
  );
  await expect(scene).toHaveAttribute(
    "data-camera-id",
    identities.cameraId ?? "",
  );
  await expect(scene).toHaveAttribute(
    "data-property-id",
    identities.propertyId ?? "",
  );
  await expect(scene).toHaveAttribute(
    "data-scene-asset-id",
    identities.assetId ?? "",
  );
  await expect(sceneImage).toHaveAttribute("src", imageSrc ?? "");
  await expect(outline).toHaveAttribute(
    "data-outline-points",
    outlinePoints ?? "",
  );
  expect(observations.requests).toHaveLength(requestCountBeforeConfirmation);

  const confirmed = await readStoredProjection(page);
  expect(confirmed).toMatchObject({
    project_version: 2,
    visible_state: "LIVE_ROOF_ASSEMBLY",
    latest_cursor: 2,
    roof_surfaces: [],
    roof_facts: null,
    panel_objects: [],
    energy_model: null,
    minimum_usable_ready: false,
  });
  expect(
    (confirmed?.events as Array<{ type: string }>).map((event) => event.type),
  ).toEqual(["ADDRESS_RESOLVED", "PROPERTY_CONFIRMED"]);
  await expect(page.locator("[data-panel-id]")).toHaveCount(0);
  await expect(
    page.getByText(/apply next modeled work|roof progress|energy model ready/i),
  ).toHaveCount(0);
  await expect(
    page.getByText(/pricing|update system|project lenses/i),
  ).toHaveCount(0);
  expect(observations.browserErrors).toEqual([]);
  expect(observations.httpErrors).toEqual([]);
  expect(observations.externalRequests).toEqual([]);
});

test("same-session reload and direct project entry restore the identical confirmation projection", async ({
  page,
}) => {
  const observations = observe(page);
  await page.goto("/");
  await enterAddressWithKeyboard(page);
  await expect(
    page.getByRole("heading", { name: "Is this your property?" }),
  ).toBeVisible();
  const scene = page.locator('[data-scene-shell="persistent"]');
  const expected = await scene.evaluate((node) => ({
    asset: node.getAttribute("data-scene-asset-id"),
    camera: node.getAttribute("data-camera-id"),
    property: node.getAttribute("data-property-id"),
    scene: node.getAttribute("data-scene-id"),
  }));
  const outlinePoints = await page
    .locator("[data-property-outline]")
    .getAttribute("data-outline-points");

  await page.reload();
  await expect(
    page.getByText("This project was restored from this browser session."),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Is this your property?" }),
  ).toBeVisible();
  await expect(scene).toHaveAttribute("data-scene-id", expected.scene ?? "");
  await expect(scene).toHaveAttribute("data-camera-id", expected.camera ?? "");
  await expect(scene).toHaveAttribute(
    "data-property-id",
    expected.property ?? "",
  );
  await expect(scene).toHaveAttribute(
    "data-scene-asset-id",
    expected.asset ?? "",
  );
  await expect(page.locator("[data-property-outline]")).toHaveAttribute(
    "data-outline-points",
    outlinePoints ?? "",
  );

  await page.goto("/");
  await page.goto("/project");
  await expect(
    page.getByRole("heading", { name: "Is this your property?" }),
  ).toBeVisible();
  await expect(scene).toHaveAttribute("data-scene-id", expected.scene ?? "");
  await expect(scene).toHaveAttribute("data-camera-id", expected.camera ?? "");
  await expect(scene).toHaveAttribute(
    "data-property-id",
    expected.property ?? "",
  );
  expect(observations.browserErrors).toEqual([]);
  expect(observations.httpErrors).toEqual([]);
  expect(observations.externalRequests).toEqual([]);
});

test("correction clears the pending latch and reselection preserves the project root", async ({
  page,
}) => {
  const observations = observe(page);
  await page.addInitScript(() => {
    Object.defineProperty(window, "__cpCorrectionDocumentToken", {
      configurable: false,
      value: globalThis.crypto.randomUUID(),
      writable: false,
    });
  });
  await page.goto("/");
  const documentToken = await page.evaluate(
    () =>
      (window as Window & { __cpCorrectionDocumentToken?: string })
        .__cpCorrectionDocumentToken,
  );
  let input = page.getByRole("combobox", { name: "Home address" });
  await page.getByRole("button", { name: "How it works" }).click();
  await expect(
    page.getByRole("dialog", { name: "How it works" }),
  ).toBeVisible();
  await input.click();
  await input.fill("123 Maple St");
  await page.getByRole("option").click();
  await expect(
    page.getByRole("heading", { name: "Is this your property?" }),
  ).toBeVisible();
  await expect(page.getByRole("dialog", { name: "How it works" })).toHaveCount(
    0,
  );
  const firstProjection = await readStoredProjection(page);

  await page.getByRole("button", { name: "Not your property?" }).click();
  await expect(page).toHaveURL(`${APP_ORIGIN}/`);
  input = page.getByRole("combobox", { name: "Home address" });
  await expect(input).toHaveValue("123 Maple St, Austin, TX 78704");
  await expect(input).toBeFocused();
  await expect(
    page.getByText("No active browser-session project was found"),
  ).toHaveCount(0);
  expect(
    await page.evaluate(
      () =>
        (window as Window & { __cpCorrectionDocumentToken?: string })
          .__cpCorrectionDocumentToken,
    ),
  ).toBe(documentToken);
  const correctedProjection = await readStoredProjection(page);
  expect(correctedProjection).toMatchObject({
    session_project_id: firstProjection?.session_project_id,
    visible_state: "ADDRESS_ENTRY",
    normalized_address: null,
    source_kind: null,
    certainty_kind: null,
    property: null,
    scene: null,
    roof_surfaces: [],
    roof_facts: null,
    panel_objects: [],
    energy_model: null,
    minimum_usable_ready: false,
  });
  await expect(page.locator('[data-scene-shell="persistent"]')).toHaveCount(0);
  await page.evaluate((storageKey) => {
    const original = Storage.prototype.setItem;
    Storage.prototype.setItem = function failCorrectionOnce(key, value) {
      if (key === storageKey) {
        Storage.prototype.setItem = original;
        throw new DOMException(
          "Injected corrected-project session write failure",
          "QuotaExceededError",
        );
      }
      return original.call(this, key, value);
    };
  }, SESSION_PROJECT_STORAGE_KEY);
  await input.fill("123 Maple");
  await page.getByRole("option").click();
  await expect(
    page
      .getByRole("alert")
      .filter({ hasText: "could not be saved in this browser session" }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Retry demo lookup" }),
  ).toBeVisible();
  const failedProjection = await readStoredProjection(page);
  expect(failedProjection?.session_project_id).toBe(
    firstProjection?.session_project_id,
  );
  expect(failedProjection?.property).toBeNull();
  await page.getByRole("button", { name: "Retry demo lookup" }).click();
  await expect(
    page.getByRole("heading", { name: "Is this your property?" }),
  ).toBeVisible();
  const secondProjection = await readStoredProjection(page);

  expect(secondProjection?.session_project_id).toBe(
    firstProjection?.session_project_id,
  );
  expect(
    (secondProjection?.property as { property_id?: string }).property_id,
  ).not.toBe(
    (firstProjection?.property as { property_id?: string }).property_id,
  );
  expect((secondProjection?.scene as { scene_id?: string }).scene_id).not.toBe(
    (firstProjection?.scene as { scene_id?: string }).scene_id,
  );
  expect(
    (secondProjection?.scene as { camera_id?: string }).camera_id,
  ).not.toBe((firstProjection?.scene as { camera_id?: string }).camera_id);
  expect(
    (secondProjection?.events as Array<{ type: string }>).map(
      (event) => event.type,
    ),
  ).toEqual(["ADDRESS_RESOLVED", "PROJECT_MUTATED", "ADDRESS_RESOLVED"]);
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
    page.getByRole("heading", { name: "Is this your property?" }),
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
    page.getByRole("heading", { name: "Is this your property?" }),
  ).toBeVisible();
  const projection = await readStoredProjection(page);
  expect(projection?.events).toHaveLength(1);
  expect(projection?.project_version).toBe(1);
});

test("a scene-asset failure keeps the same candidate, outline, source labels, confirmation, and correction", async ({
  page,
}) => {
  const observations = observe(page);
  await page.goto("/");
  await enterAddressWithKeyboard(page);
  await expect(
    page.getByRole("heading", { name: "Is this your property?" }),
  ).toBeVisible();
  const scene = page.locator('[data-scene-shell="persistent"]');
  const before = await scene.evaluate((node) => ({
    camera: node.getAttribute("data-camera-id"),
    property: node.getAttribute("data-property-id"),
    scene: node.getAttribute("data-scene-id"),
  }));
  await scene.evaluate((node) => {
    (
      node as HTMLElement & { __assetFailureToken?: string }
    ).__assetFailureToken = "same-fallback-boundary";
  });
  await scene.locator("[data-property-scene-image]").evaluate((node) => {
    node.dispatchEvent(new Event("error"));
  });

  await expect(
    page.getByRole("img", {
      name: /property image unavailable.*identity is unchanged/i,
    }),
  ).toBeVisible();
  await expect(
    page.getByRole("status").filter({
      hasText:
        "Seeded demo property image unavailable. Property identity and details remain unchanged.",
    }),
  ).toBeVisible();
  await expect(page.getByText("Scene image unavailable")).toBeVisible();
  await expect(page.getByText("Demo property match")).toBeVisible();
  await expect(page.getByText("Modeled", { exact: true })).toBeVisible();
  await expect(page.locator("[data-property-outline]")).toHaveCount(1);
  await expect(
    page.getByRole("button", { name: "Yes, this is my property" }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Not your property?" }),
  ).toBeVisible();
  expect(
    await scene.evaluate(
      (node) =>
        (node as HTMLElement & { __assetFailureToken?: string })
          .__assetFailureToken,
    ),
  ).toBe("same-fallback-boundary");
  await expect(scene).toHaveAttribute("data-scene-id", before.scene ?? "");
  await expect(scene).toHaveAttribute("data-camera-id", before.camera ?? "");
  await expect(scene).toHaveAttribute(
    "data-property-id",
    before.property ?? "",
  );
  await expect(
    page.getByText(/Nearmap|Google|verified|high confidence/i),
  ).toHaveCount(0);

  await page.getByRole("button", { name: "Yes, this is my property" }).click();
  await expect(
    page.getByRole("heading", { name: "Property confirmed." }),
  ).toBeFocused();
  expect(
    await scene.evaluate(
      (node) =>
        (node as HTMLElement & { __assetFailureToken?: string })
          .__assetFailureToken,
    ),
  ).toBe("same-fallback-boundary");
  expect(observations.browserErrors).toEqual([]);
  expect(observations.httpErrors).toEqual([]);
  expect(observations.externalRequests).toEqual([]);
});

test("keyboard focus and reduced motion preserve the same confirmation information and scene", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await enterAddressWithKeyboard(page);
  const heading = page.getByRole("heading", { name: "Is this your property?" });
  const scene = page.locator('[data-scene-shell="persistent"]');
  const primary = page.getByRole("button", {
    name: "Yes, this is my property",
  });
  const correction = page.getByRole("button", { name: "Not your property?" });
  await expect(heading).toBeFocused();
  expect(
    await page.evaluate(
      () => matchMedia("(prefers-reduced-motion: reduce)").matches,
    ),
  ).toBe(true);
  expect(
    await scene.evaluate((node) => ({
      animationName: getComputedStyle(node).animationName,
      transform: getComputedStyle(node).transform,
    })),
  ).toEqual({ animationName: "none", transform: "none" });

  await page.keyboard.press("Tab");
  await expect(primary).toBeFocused();
  expect(await primary.evaluate((node) => node.matches(":focus-visible"))).toBe(
    true,
  );
  await page.keyboard.press("Tab");
  await expect(correction).toBeFocused();
  expect(
    await correction.evaluate((node) => node.matches(":focus-visible")),
  ).toBe(true);
  await page.keyboard.press("Shift+Tab");
  await page.keyboard.press("Enter");
  await expect(
    page.getByRole("heading", { name: "Property confirmed." }),
  ).toBeFocused();
  await expect(scene).toHaveCount(1);
  await expect(
    page.getByText("Roof analysis is pending and has not started yet."),
  ).toBeVisible();
  await expect(page.locator("[data-panel-id]")).toHaveCount(0);
});

test("forged stored state and direct route entry cannot bypass confirmation", async ({
  page,
}) => {
  const observations = observe(page);
  await page.goto("/");
  await enterAddressWithKeyboard(page);
  await expect(
    page.getByRole("heading", { name: "Is this your property?" }),
  ).toBeVisible();
  await page.evaluate((key) => {
    const serialized = sessionStorage.getItem(key);
    if (serialized === null) throw new Error("CONFIRMATION_PROJECTION_MISSING");
    const forged = JSON.parse(serialized) as Record<string, unknown>;
    forged.visible_state = "LIVE_ROOF_ASSEMBLY";
    forged.minimum_usable_ready = true;
    sessionStorage.setItem(key, JSON.stringify(forged));
  }, SESSION_PROJECT_STORAGE_KEY);

  await page.goto("/project");
  await expect(
    page.getByText(/invalid browser-session data was cleared/i),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: /Build your solar project/ }),
  ).toBeVisible();
  await expect(page.locator('[data-scene-shell="persistent"]')).toHaveCount(0);
  expect(await readStoredProjection(page)).toBeNull();
  expect(observations.browserErrors).toEqual([]);
  expect(observations.httpErrors).toEqual([]);
  expect(observations.externalRequests).toEqual([]);
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

for (const viewport of [
  { width: 1536, height: 1024 },
  { width: 1440, height: 900 },
  { width: 1024, height: 768 },
  { width: 390, height: 844 },
]) {
  test(`property confirmation preserves hierarchy, targets, and zero overflow at ${viewport.width}x${viewport.height}`, async ({
    page,
  }) => {
    await page.setViewportSize(viewport);
    await page.goto("/");
    await enterAddressWithKeyboard(page);
    await expect(
      page.getByRole("heading", {
        level: 1,
        name: "Is this your property?",
      }),
    ).toBeVisible();
    const scene = page.locator('[data-scene-shell="persistent"]');
    const details = page.getByRole("complementary", {
      name: "Property details",
    });
    const summary = page.getByRole("region", {
      name: "What we know so far",
    });
    const primary = page.getByRole("button", {
      name: "Yes, this is my property",
    });
    const correction = page.getByRole("button", {
      name: "Not your property?",
    });
    for (const region of [scene, details, summary, primary, correction]) {
      await expect(region).toBeVisible();
      const box = await region.boundingBox();
      expect(box).not.toBeNull();
      expect(box?.x ?? -1).toBeGreaterThanOrEqual(0);
      expect((box?.x ?? 0) + (box?.width ?? 0)).toBeLessThanOrEqual(
        viewport.width,
      );
    }
    for (const control of [primary, correction]) {
      const box = await control.boundingBox();
      expect(box?.height ?? 0).toBeGreaterThanOrEqual(44);
    }
    expect(
      await page.evaluate(() => {
        const decision = document.querySelector(".s2-decision");
        const sceneNode = document.querySelector(".property-scene");
        const detailsNode = document.querySelector(".s2-details");
        const known = document.querySelector(".s2-known");
        if (!decision || !sceneNode || !detailsNode || !known) return false;
        return (
          Boolean(
            decision.compareDocumentPosition(sceneNode) &
            Node.DOCUMENT_POSITION_FOLLOWING,
          ) &&
          Boolean(
            sceneNode.compareDocumentPosition(detailsNode) &
            Node.DOCUMENT_POSITION_FOLLOWING,
          ) &&
          Boolean(
            detailsNode.compareDocumentPosition(known) &
            Node.DOCUMENT_POSITION_FOLLOWING,
          )
        );
      }),
    ).toBe(true);
    await expect(page.locator("[data-property-scene-image]")).toHaveCount(1);
    await expect(page.locator("[data-property-outline]")).toHaveCount(1);
    await expect(page.locator("[data-panel-id]")).toHaveCount(0);
    await expect(
      page.getByText(
        /Nearmap|Google|May 2025|address verified|high confidence/i,
      ),
    ).toHaveCount(0);
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
    firstPage.getByRole("heading", { name: "Is this your property?" }),
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
