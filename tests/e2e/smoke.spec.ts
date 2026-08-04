import { expect, test } from "@playwright/test";

import { SESSION_PROJECT_STORAGE_KEY } from "../../src/project/adapters/browser-runtime";

test("production runtime completes the semantic S1-S2 contract, preserves scene identity, and restores", async ({
  page,
}) => {
  const browserErrors: string[] = [];
  const httpErrors: string[] = [];
  const externalRequests: string[] = [];
  page.on("pageerror", (error) => browserErrors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") browserErrors.push(message.text());
  });
  page.on("response", (response) => {
    if (response.status() >= 400) {
      httpErrors.push(`${response.status()} ${response.url()}`);
    }
  });
  page.on("request", (request) => {
    if (!request.url().startsWith("http://127.0.0.1:3100")) {
      externalRequests.push(request.url());
    }
  });

  const response = await page.goto("/");
  expect(response?.status()).toBe(200);
  await expect(page.locator("main")).toHaveCount(1);
  await expect(page.locator("main")).toHaveAttribute(
    "data-product-surface",
    "s1-s2-pre-account-runtime",
  );
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Pre-account project runtime",
  );
  await expect(
    page.getByRole("heading", { name: "Address entry runtime" }),
  ).toBeVisible();

  await page
    .getByRole("button", { name: "Create seeded project for 123 Maple St" })
    .click();
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
  ).toBeVisible();
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

  await page.setViewportSize({ width: 390, height: 844 });
  const hasHorizontalOverflow = await page.evaluate(
    () =>
      document.documentElement.scrollWidth >
      document.documentElement.clientWidth,
  );
  expect(hasHorizontalOverflow).toBe(false);
  expect(browserErrors).toEqual([]);
  expect(httpErrors).toEqual([]);
  expect(externalRequests).toEqual([]);
});

test("a new browser context starts fresh without inheriting another session project", async ({
  browser,
}) => {
  const firstContext = await browser.newContext({
    baseURL: "http://127.0.0.1:3100",
  });
  const firstPage = await firstContext.newPage();
  await firstPage.goto("/");
  await firstPage
    .getByRole("button", { name: "Create seeded project for 123 Maple St" })
    .click();
  await expect(
    firstPage.getByRole("heading", { name: "Property confirmation runtime" }),
  ).toBeVisible();

  const freshContext = await browser.newContext({
    baseURL: "http://127.0.0.1:3100",
  });
  const freshPage = await freshContext.newPage();
  await freshPage.goto("/");
  await expect(
    freshPage.getByRole("heading", { name: "Address entry runtime" }),
  ).toBeVisible();
  await expect(freshPage.getByText(/no session project exists/i)).toBeVisible();

  await firstContext.close();
  await freshContext.close();
});

test("malicious session data recovers to fresh S1 without script or URL injection", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
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
    page.getByText(/invalid session data was cleared/i),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Address entry runtime" }),
  ).toBeVisible();
  await expect(page.locator("img")).toHaveCount(0);
  await expect(page.locator('a[href*="evil.example"]')).toHaveCount(0);
  expect(await page.evaluate(() => "pwned" in window)).toBe(false);
  expect(errors).toEqual([]);
});
