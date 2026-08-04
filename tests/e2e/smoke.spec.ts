import { expect, test } from "@playwright/test";

test("production root is available, semantic, responsive, and error-free", async ({
  page,
}) => {
  const browserErrors: string[] = [];
  const sameOriginHttpErrors: string[] = [];
  page.on("pageerror", (error) => browserErrors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") {
      browserErrors.push(message.text());
    }
  });
  page.on("response", (response) => {
    if (
      response.url().startsWith("http://127.0.0.1:3100") &&
      response.status() >= 400
    ) {
      sameOriginHttpErrors.push(`${response.status()} ${response.url()}`);
    }
  });

  const response = await page.goto("/");
  expect(response?.status()).toBe(200);
  await expect(page.locator("main")).toHaveCount(1);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Repository foundation ready",
  );
  await expect(
    page.getByText("The application started successfully"),
  ).toBeVisible();
  await expect(page.getByRole("button")).toHaveCount(0);
  await expect(page.getByRole("link")).toHaveCount(0);

  await page.setViewportSize({ width: 390, height: 844 });
  const hasHorizontalOverflow = await page.evaluate(
    () =>
      document.documentElement.scrollWidth >
      document.documentElement.clientWidth,
  );
  expect(hasHorizontalOverflow).toBe(false);
  expect(browserErrors).toEqual([]);
  expect(sameOriginHttpErrors).toEqual([]);
});
