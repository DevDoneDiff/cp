import { expect, type Locator, type Page, test } from "@playwright/test";

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

async function expectNoVisualOverlap(
  first: Locator,
  second: Locator,
): Promise<void> {
  const [firstBox, secondBox] = await Promise.all([
    first.boundingBox(),
    second.boundingBox(),
  ]);
  expect(firstBox).not.toBeNull();
  expect(secondBox).not.toBeNull();
  const overlapWidth = Math.max(
    0,
    Math.min(firstBox!.x + firstBox!.width, secondBox!.x + secondBox!.width) -
      Math.max(firstBox!.x, secondBox!.x),
  );
  const overlapHeight = Math.max(
    0,
    Math.min(firstBox!.y + firstBox!.height, secondBox!.y + secondBox!.height) -
      Math.max(firstBox!.y, secondBox!.y),
  );
  expect(overlapWidth * overlapHeight).toBe(0);
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

async function beginProjectionHistory(page: Page): Promise<void> {
  await page.evaluate((key) => {
    const target = window as Window & {
      __cpProjectionHistory?: Array<Record<string, unknown>>;
    };
    target.__cpProjectionHistory = [];
    const original = Storage.prototype.setItem;
    Storage.prototype.setItem = function recordProjection(storageKey, value) {
      if (storageKey === key) {
        target.__cpProjectionHistory?.push(
          JSON.parse(value) as Record<string, unknown>,
        );
      }
      return original.call(this, storageKey, value);
    };
  }, SESSION_PROJECT_STORAGE_KEY);
}

async function readProjectionHistory(
  page: Page,
): Promise<Array<Record<string, unknown>>> {
  return page.evaluate(
    () =>
      (
        window as Window & {
          __cpProjectionHistory?: Array<Record<string, unknown>>;
        }
      ).__cpProjectionHistory ?? [],
  );
}

async function markAssemblyContinuity(page: Page): Promise<void> {
  await page.evaluate(() => {
    const scene = document.querySelector('[data-scene-shell="persistent"]');
    if (!(scene instanceof HTMLElement)) {
      throw new Error("PERSISTENT_SCENE_MISSING");
    }
    (
      scene as HTMLElement & { __assemblyContinuityToken?: string }
    ).__assemblyContinuityToken = "same-assembly-scene";
    const observer = new MutationObserver(() => {
      const firstPanel = document.querySelector("[data-panel-id]");
      if (
        firstPanel instanceof SVGElement &&
        !("__assemblyPanelToken" in firstPanel)
      ) {
        (
          firstPanel as SVGElement & { __assemblyPanelToken?: string }
        ).__assemblyPanelToken = "same-first-panel";
      }
    });
    observer.observe(scene, { childList: true, subtree: true });
  });
}

async function expectAssemblyContinuity(page: Page): Promise<void> {
  expect(
    await page
      .locator('[data-scene-shell="persistent"]')
      .evaluate(
        (node) =>
          (node as HTMLElement & { __assemblyContinuityToken?: string })
            .__assemblyContinuityToken,
      ),
  ).toBe("same-assembly-scene");
  expect(
    await page
      .locator("[data-panel-id]")
      .first()
      .evaluate(
        (node) =>
          (node as SVGElement & { __assemblyPanelToken?: string })
            .__assemblyPanelToken,
      ),
  ).toBe("same-first-panel");
}

function panelIdentity(panel: unknown): Record<string, unknown> {
  const candidate = panel as Record<string, unknown>;
  return {
    panel_id: candidate.panel_id,
    surface_id: candidate.surface_id,
    placement_rank: candidate.placement_rank,
    geometry: candidate.geometry,
    render_status: candidate.render_status,
    selection_state: candidate.selection_state,
  };
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
    assembly_provenance_contract: "CANONICAL_SCHEDULE_V1",
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

test("explicit confirmation preserves the document, scene, asset, outline, and identities before the first accepted work event", async ({
  page,
}) => {
  const observations = observe(page);
  await page.route("**/api/project/assembly/stream?**", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "text/event-stream",
      headers: { "Cache-Control": "no-store, no-transform" },
      body: ": test stream closed before work\n\n",
    });
  });
  await page.route("**/api/project/assembly/poll?**", async (route) => {
    const url = new URL(route.request().url());
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      headers: { "Cache-Control": "no-store" },
      body: JSON.stringify({
        schema_version: 1,
        fixture_version: url.searchParams.get("fixture_version"),
        after_cursor: Number(url.searchParams.get("after_cursor")),
        feed_complete: false,
        events: [],
      }),
    });
  });
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
    page.getByRole("heading", { name: "Building your solar model..." }),
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
  await expect
    .poll(
      () =>
        observations.requests.filter((url) =>
          url.includes("/api/project/assembly/"),
        ).length,
    )
    .toBeGreaterThan(0);
  const assemblyRequests = observations.requests.slice(
    requestCountBeforeConfirmation,
  );
  expect(assemblyRequests.length).toBeGreaterThan(0);
  expect(
    assemblyRequests.every((requestUrl) => {
      const url = new URL(requestUrl);
      return (
        url.origin === APP_ORIGIN &&
        ["/api/project/assembly/stream", "/api/project/assembly/poll"].includes(
          url.pathname,
        ) &&
        !url.search.includes("123+Maple") &&
        !url.search.includes("address")
      );
    }),
  ).toBe(true);

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
  await expect(page.locator("[data-roof-surface-layer]")).toHaveCount(0);
  await expect(
    page.getByText(/apply next modeled work|update system|project lenses/i),
  ).toHaveCount(0);
  await expect(
    page.getByText(/pricing|update system|project lenses/i),
  ).toHaveCount(0);
  expect(observations.browserErrors).toEqual([]);
  expect(observations.httpErrors).toEqual([]);
  expect(observations.externalRequests).toEqual([]);
});

test("native SSE reveals only accepted roof, panel, energy, and readiness events and restores the ready projection without replay", async ({
  page,
}) => {
  const observations = observe(page);
  await page.setViewportSize({ width: 1536, height: 1024 });
  await page.goto("/");
  await enterAddressWithKeyboard(page);
  await expect(
    page.getByRole("heading", { name: "Is this your property?" }),
  ).toBeVisible();
  await beginProjectionHistory(page);
  await markAssemblyContinuity(page);

  const sceneBefore = await page
    .locator('[data-scene-shell="persistent"]')
    .evaluate((node) => ({
      asset: node.getAttribute("data-scene-asset-id"),
      camera: node.getAttribute("data-camera-id"),
      property: node.getAttribute("data-property-id"),
      scene: node.getAttribute("data-scene-id"),
    }));
  await page.getByRole("button", { name: "Yes, this is my property" }).click();
  await expect(
    page.getByRole("heading", { name: "Your starting demo model is ready." }),
  ).toBeFocused();
  await expect(page.locator("[data-roof-surface-layer] polygon")).toHaveCount(
    2,
  );
  await expect(page.locator("[data-panel-id]")).toHaveCount(4);
  await expect(page.getByText("1,840 sq ft").first()).toBeVisible();
  await expect(page.getByText("9,800 kWh/yr").first()).toBeVisible();
  await expectAssemblyContinuity(page);

  const history = await readProjectionHistory(page);
  expect(history).toHaveLength(8);
  expect(
    history.map(
      (projection) =>
        (projection.events as Array<{ type: string }>).at(-1)?.type,
    ),
  ).toEqual([
    "PROPERTY_CONFIRMED",
    "ROOF_GEOMETRY_READY",
    "PANEL_OBJECT_ADDED",
    "PANEL_OBJECT_ADDED",
    "PANEL_OBJECT_ADDED",
    "PANEL_OBJECT_ADDED",
    "ENERGY_MODEL_READY",
    "MINIMUM_USABLE_READY",
  ]);
  expect(
    history.map((projection) => ({
      energy: projection.energy_model !== null,
      panels: (projection.panel_objects as unknown[]).length,
      ready: projection.minimum_usable_ready,
      roof: (projection.roof_surfaces as unknown[]).length,
    })),
  ).toEqual([
    { energy: false, panels: 0, ready: false, roof: 0 },
    { energy: false, panels: 0, ready: false, roof: 2 },
    { energy: false, panels: 1, ready: false, roof: 2 },
    { energy: false, panels: 2, ready: false, roof: 2 },
    { energy: false, panels: 3, ready: false, roof: 2 },
    { energy: false, panels: 4, ready: false, roof: 2 },
    { energy: true, panels: 4, ready: false, roof: 2 },
    { energy: true, panels: 4, ready: true, roof: 2 },
  ]);
  const firstAcceptedPanel = panelIdentity(
    (history[2]?.panel_objects as unknown[])[0],
  );
  for (const projection of history.slice(2)) {
    expect(panelIdentity((projection.panel_objects as unknown[])[0])).toEqual(
      firstAcceptedPanel,
    );
  }

  const readyProjection = await readStoredProjection(page);
  const readyPanelIdentities = (
    readyProjection?.panel_objects as unknown[]
  ).map(panelIdentity);
  const readyEventIds = (
    readyProjection?.events as Array<{ event_id: string }>
  ).map((event) => event.event_id);
  expect(new Set(readyEventIds).size).toBe(readyEventIds.length);
  const assemblyRequestsBeforeReload = observations.requests.filter((url) =>
    url.includes("/api/project/assembly/"),
  );
  expect(assemblyRequestsBeforeReload.length).toBeGreaterThan(0);
  expect(
    assemblyRequestsBeforeReload.some(
      (url) => new URL(url).pathname === "/api/project/assembly/stream",
    ),
  ).toBe(true);
  expect(
    assemblyRequestsBeforeReload.some(
      (url) => new URL(url).pathname === "/api/project/assembly/poll",
    ),
  ).toBe(false);

  await page.reload();
  const restoredNotice = page.getByText(
    "This project was restored from this browser session.",
  );
  await expect(restoredNotice).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Your starting demo model is ready." }),
  ).toBeVisible();
  await expect(page.locator("[data-panel-id]")).toHaveCount(4);
  await expectNoVisualOverlap(
    restoredNotice,
    page.locator(".s2-assembly-badge"),
  );
  const restored = await readStoredProjection(page);
  expect(restored).toMatchObject({
    minimum_usable_ready: true,
    latest_cursor: readyProjection?.latest_cursor,
    project_version: readyProjection?.project_version,
    scene: readyProjection?.scene,
  });
  expect((restored?.panel_objects as unknown[]).map(panelIdentity)).toEqual(
    readyPanelIdentities,
  );
  expect(
    (restored?.events as Array<{ event_id: string }>).map(
      (event) => event.event_id,
    ),
  ).toEqual(readyEventIds);
  const restoredScene = page.locator('[data-scene-shell="persistent"]');
  await expect(restoredScene).toHaveAttribute(
    "data-scene-id",
    sceneBefore.scene ?? "",
  );
  await expect(restoredScene).toHaveAttribute(
    "data-camera-id",
    sceneBefore.camera ?? "",
  );
  await expect(restoredScene).toHaveAttribute(
    "data-property-id",
    sceneBefore.property ?? "",
  );
  await expect(restoredScene).toHaveAttribute(
    "data-scene-asset-id",
    sceneBefore.asset ?? "",
  );
  expect(
    observations.requests.filter((url) =>
      url.includes("/api/project/assembly/"),
    ),
  ).toEqual(assemblyRequestsBeforeReload);
  await expect(
    page.getByText(/Update system|project lenses|pricing|create account/i),
  ).toHaveCount(0);
  expect(observations.browserErrors).toEqual([]);
  expect(observations.httpErrors).toEqual([]);
  expect(observations.externalRequests).toEqual([]);
});

test("an SSE close resumes bounded polling from the accepted cursor without replacing the scene or panels", async ({
  page,
}) => {
  const observations = observe(page);
  await page.route("**/api/project/assembly/stream?**", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "text/event-stream",
      headers: { "Cache-Control": "no-store, no-transform" },
      body: ": injected deterministic stream close\n\n",
    });
  });
  await page.goto("/");
  await enterAddressWithKeyboard(page);
  await expect(
    page.getByRole("heading", { name: "Is this your property?" }),
  ).toBeVisible();
  await markAssemblyContinuity(page);
  await page.getByRole("button", { name: "Yes, this is my property" }).click();
  await expect
    .poll(
      () =>
        page
          .locator('[data-visible-state="LIVE_ROOF_ASSEMBLY"]')
          .getAttribute("data-assembly-phase"),
      { timeout: 5_000 },
    )
    .toBe("polling");
  await expect(
    page.getByText(
      "The event stream paused. Bounded polling is continuing from your last accepted update.",
    ),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Your starting demo model is ready." }),
  ).toBeFocused({ timeout: 15_000 });
  await expect(page.locator("[data-panel-id]")).toHaveCount(4);
  await expectAssemblyContinuity(page);

  const projection = await readStoredProjection(page);
  expect(projection).toMatchObject({
    minimum_usable_ready: true,
    latest_cursor: 9,
    project_version: 9,
  });
  const panelIdentities = (projection?.panel_objects as unknown[]).map(
    panelIdentity,
  );
  expect(new Set(panelIdentities.map((panel) => panel.panel_id)).size).toBe(4);
  const eventIds = (
    projection?.events as Array<{ event_id: string; type: string }>
  ).map((event) => event.event_id);
  expect(new Set(eventIds).size).toBe(eventIds.length);
  expect(
    (projection?.events as Array<{ type: string }>).map((event) => event.type),
  ).toEqual([
    "ADDRESS_RESOLVED",
    "PROPERTY_CONFIRMED",
    "ROOF_GEOMETRY_READY",
    "PANEL_OBJECT_ADDED",
    "PANEL_OBJECT_ADDED",
    "PANEL_OBJECT_ADDED",
    "PANEL_OBJECT_ADDED",
    "ENERGY_MODEL_READY",
    "MINIMUM_USABLE_READY",
  ]);
  const assemblyRequests = observations.requests.filter((url) =>
    url.includes("/api/project/assembly/"),
  );
  expect(new URL(assemblyRequests[0] ?? APP_ORIGIN).pathname).toBe(
    "/api/project/assembly/stream",
  );
  const pollCursors = assemblyRequests
    .filter((url) => new URL(url).pathname === "/api/project/assembly/poll")
    .map((url) => Number(new URL(url).searchParams.get("after_cursor")));
  expect(pollCursors.length).toBeGreaterThanOrEqual(7);
  expect(pollCursors[0]).toBe(2);
  expect(pollCursors.at(-1)).toBe(8);
  expect(
    pollCursors.every(
      (cursor, index) => index === 0 || cursor >= pollCursors[index - 1]!,
    ),
  ).toBe(true);
  expect(observations.browserErrors).toEqual([]);
  expect(observations.httpErrors).toEqual([]);
  expect(observations.externalRequests).toEqual([]);
});

test("fallback exhaustion preserves restored partial work and retry completes without duplication", async ({
  page,
}) => {
  const observations = observe(page);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.clock.install();
  await page.goto("/");
  await enterAddressWithKeyboard(page);
  await page.getByRole("button", { name: "Yes, this is my property" }).click();
  await page.waitForFunction((key) => {
    const serialized = sessionStorage.getItem(key);
    if (serialized === null) return false;
    const projection = JSON.parse(serialized) as {
      minimum_usable_ready: boolean;
      panel_objects: unknown[];
    };
    return (
      !projection.minimum_usable_ready &&
      projection.panel_objects.length >= 1 &&
      projection.panel_objects.length < 4
    );
  }, SESSION_PROJECT_STORAGE_KEY);
  const partial = await readStoredProjection(page);
  const partialPanels = (partial?.panel_objects as unknown[]).map(
    panelIdentity,
  );
  expect(partialPanels.length).toBeGreaterThanOrEqual(1);
  expect(partialPanels.length).toBeLessThan(4);

  const emptyStream = async (
    route: Parameters<Parameters<Page["route"]>[1]>[0],
  ) => {
    await route.fulfill({
      status: 200,
      contentType: "text/event-stream",
      headers: { "Cache-Control": "no-store, no-transform" },
      body: ": injected exhausted stream\n\n",
    });
  };
  const emptyPoll = async (
    route: Parameters<Parameters<Page["route"]>[1]>[0],
  ) => {
    const url = new URL(route.request().url());
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      headers: { "Cache-Control": "no-store" },
      body: JSON.stringify({
        schema_version: 1,
        fixture_version: url.searchParams.get("fixture_version"),
        after_cursor: Number(url.searchParams.get("after_cursor")),
        feed_complete: false,
        events: [],
      }),
    });
  };
  await page.route("**/api/project/assembly/stream?**", emptyStream);
  await page.route("**/api/project/assembly/poll?**", emptyPoll);
  await page.reload();
  await expect(
    page.getByText("This project was restored from this browser session."),
  ).toBeVisible();
  await expect
    .poll(
      () =>
        page
          .locator('[data-visible-state="LIVE_ROOF_ASSEMBLY"]')
          .getAttribute("data-assembly-phase"),
      { timeout: 5_000 },
    )
    .toBe("polling");
  for (let second = 0; second < 38; second += 1) {
    await page.clock.fastForward(1_000);
    await new Promise((resolve) => setTimeout(resolve, 10));
  }
  await expect(
    page.getByRole("alert").filter({ hasText: "Live assembly paused" }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Retry assembly" }),
  ).toBeVisible();
  const exhausted = await readStoredProjection(page);
  expect(exhausted?.minimum_usable_ready).toBe(false);
  expect((exhausted?.panel_objects as unknown[]).map(panelIdentity)).toEqual(
    partialPanels,
  );
  await expect(page.locator("[data-panel-id]")).toHaveCount(
    partialPanels.length,
  );
  expect(
    await page.locator("[data-panel-id]").evaluateAll((panels) =>
      panels.every((panel) => {
        const style = getComputedStyle(panel);
        const shape = panel.querySelector(".panel-object-shape");
        return (
          style.animationName === "none" &&
          shape !== null &&
          getComputedStyle(shape).transform === "none"
        );
      }),
    ),
  ).toBe(true);

  await page.unroute("**/api/project/assembly/stream?**", emptyStream);
  await page.unroute("**/api/project/assembly/poll?**", emptyPoll);
  await page.getByRole("button", { name: "Retry assembly" }).click();
  await expect(
    page.getByRole("heading", { name: "Your starting demo model is ready." }),
  ).toBeFocused({ timeout: 10_000 });
  await expect(page.locator("[data-panel-id]")).toHaveCount(4);
  const ready = await readStoredProjection(page);
  expect(ready?.minimum_usable_ready).toBe(true);
  expect(
    (ready?.panel_objects as unknown[])
      .slice(0, partialPanels.length)
      .map(panelIdentity),
  ).toEqual(partialPanels);
  const readyPanelIds = (
    ready?.panel_objects as Array<{ panel_id: string }>
  ).map((panel) => panel.panel_id);
  const readyEventIds = (ready?.events as Array<{ event_id: string }>).map(
    (event) => event.event_id,
  );
  expect(new Set(readyPanelIds).size).toBe(4);
  expect(new Set(readyEventIds).size).toBe(readyEventIds.length);
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

test("a scene-asset failure keeps identity and accessible assembly through readiness", async ({
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
    page.getByRole("heading", {
      name: "Your starting demo model is ready.",
    }),
  ).toBeFocused();
  await expect(page.locator("[data-panel-id]")).toHaveCount(4);
  await expect(page.getByText("9,800 kWh/yr").first()).toBeVisible();
  await expect(
    page.getByText(
      "The confirmed property now has a usable preliminary demo model assembled from accepted seeded work events.",
    ),
  ).toBeVisible();
  await expect(
    page.getByText(/is becoming|appear as each accepted event arrives/i),
  ).toHaveCount(0);
  await expectNoVisualOverlap(
    page.getByRole("status").filter({
      hasText:
        "Seeded demo property image unavailable. Property identity and details remain unchanged.",
    }),
    page.locator(".s2-assembly-badge"),
  );
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
    page.getByRole("heading", {
      name: "Your starting demo model is ready.",
    }),
  ).toBeFocused();
  await expect(scene).toHaveCount(1);
  await expect(page.locator("[data-panel-id]")).toHaveCount(4);
  await expect(page.locator("[data-roof-surface-layer]")).toHaveCount(1);
  await expect(page.getByText("Ready in S2")).toBeVisible();
  expect(
    await page.locator("[data-panel-id]").evaluateAll((panels) =>
      panels.every((panel) => {
        const style = getComputedStyle(panel);
        const shape = panel.querySelector(".panel-object-shape");
        return (
          style.animationName === "none" &&
          shape !== null &&
          getComputedStyle(shape).transform === "none"
        );
      }),
    ),
  ).toBe(true);
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

for (const viewport of [
  { width: 1536, height: 1024 },
  { width: 1440, height: 900 },
  { width: 1024, height: 768 },
  { width: 390, height: 844 },
]) {
  test(`live assembly remains semantic, stable, and unclipped through readiness at ${viewport.width}x${viewport.height}`, async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.setViewportSize(viewport);
    await page.goto("/");
    await enterAddressWithKeyboard(page);
    await expect(
      page.getByRole("heading", { name: "Is this your property?" }),
    ).toBeVisible();
    await markAssemblyContinuity(page);
    const scene = page.locator('[data-scene-shell="persistent"]');
    const sceneIdentity = await scene.evaluate((node) => ({
      camera: node.getAttribute("data-camera-id"),
      property: node.getAttribute("data-property-id"),
      scene: node.getAttribute("data-scene-id"),
    }));
    await page
      .getByRole("button", { name: "Yes, this is my property" })
      .click();
    await expect(
      page.getByRole("heading", {
        level: 1,
        name: "Your starting demo model is ready.",
      }),
    ).toBeFocused();
    await expect(page.locator("[data-panel-id]")).toHaveCount(4);
    await expect(page.locator("[data-roof-surface-layer] polygon")).toHaveCount(
      2,
    );
    await expectAssemblyContinuity(page);
    await expect(scene).toHaveAttribute(
      "data-scene-id",
      sceneIdentity.scene ?? "",
    );
    await expect(scene).toHaveAttribute(
      "data-camera-id",
      sceneIdentity.camera ?? "",
    );
    await expect(scene).toHaveAttribute(
      "data-property-id",
      sceneIdentity.property ?? "",
    );

    const regions = [
      page.locator(".s2-decision.is-assembly"),
      scene,
      page.locator(".s2-details.is-assembly"),
      page.locator(".s2-known.is-assembly"),
    ];
    for (const region of regions) {
      await expect(region).toBeVisible();
      const box = await region.boundingBox();
      expect(box).not.toBeNull();
      expect(box?.x ?? -1).toBeGreaterThanOrEqual(0);
      expect((box?.x ?? 0) + (box?.width ?? 0)).toBeLessThanOrEqual(
        viewport.width,
      );
    }
    const renderedPanels = await page
      .locator("[data-panel-id]")
      .evaluateAll((panels) =>
        panels.map((panel) => ({
          geometry: panel.getAttribute("data-panel-geometry"),
          id: panel.getAttribute("data-panel-id"),
          rank: panel.getAttribute("data-panel-placement-rank"),
          renderStatus: panel.getAttribute("data-panel-render-status"),
          selectionState: panel.getAttribute("data-panel-selection-state"),
          surfaceId: panel.getAttribute("data-panel-surface-id"),
        })),
      );
    expect(renderedPanels).toHaveLength(4);
    expect(new Set(renderedPanels.map((panel) => panel.id)).size).toBe(4);
    expect(
      renderedPanels.every(
        (panel) =>
          panel.geometry !== null &&
          panel.rank !== null &&
          panel.renderStatus === "rendered" &&
          panel.selectionState === "unselected" &&
          panel.surfaceId !== null,
      ),
    ).toBe(true);
    await expect(page.getByText("1,840 sq ft").first()).toBeVisible();
    await expect(page.getByText("9,800 kWh/yr").first()).toBeVisible();
    await expect(page.getByText("Ready in S2")).toBeVisible();
    await expect(
      page.getByText(
        "The confirmed property now has a usable preliminary demo model assembled from accepted seeded work events.",
      ),
    ).toBeVisible();
    await expect(
      page.getByText(/is becoming|appear as each accepted event arrives/i),
    ).toHaveCount(0);
    await expect(
      page.getByText(/Update system|project lenses|pricing|create account/i),
    ).toHaveCount(0);
    await expectNoHorizontalOverflow(page);

    await page.reload();
    const restoredNotice = page.getByText(
      "This project was restored from this browser session.",
    );
    await expect(restoredNotice).toBeVisible();
    await expect(page.locator("[data-panel-id]")).toHaveCount(4);
    await expectNoVisualOverlap(
      restoredNotice,
      page.locator(".s2-assembly-badge"),
    );
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
