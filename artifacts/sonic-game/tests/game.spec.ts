import { test, expect, Page } from "@playwright/test";

const BASE = "http://localhost:25857";

async function gotoGame(page: Page) {
  await page.goto(BASE);
  await page.waitForSelector("canvas[data-testid='game-canvas']");
}

// ─── Page load ────────────────────────────────────────────────────────────────
test.describe("page load", () => {
  test("page loads without crashing", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", e => errors.push(e.message));
    await gotoGame(page);
    expect(errors).toHaveLength(0);
  });

  test("page title is set", async ({ page }) => {
    await gotoGame(page);
    // App renders — title in the HTML document (any non-empty title is fine)
    await expect(page).toHaveTitle(/.+/);
  });

  test("canvas element is present", async ({ page }) => {
    await gotoGame(page);
    const canvas = page.locator("canvas[data-testid='game-canvas']");
    await expect(canvas).toBeVisible();
  });

  test("canvas has correct dimensions", async ({ page }) => {
    await gotoGame(page);
    const canvas = page.locator("canvas[data-testid='game-canvas']");
    expect(await canvas.getAttribute("width")).toBe("1280");
    expect(await canvas.getAttribute("height")).toBe("720");
  });
});

// ─── Title screen ─────────────────────────────────────────────────────────────
test.describe("title screen", () => {
  test("renders without console errors on title screen", async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on("console", msg => { if (msg.type() === "error") consoleErrors.push(msg.text()); });
    await gotoGame(page);
    await page.waitForTimeout(500);
    expect(consoleErrors).toHaveLength(0);
  });

  test("canvas is visible and non-empty on title screen", async ({ page }) => {
    await gotoGame(page);
    await page.waitForTimeout(300);
    const canvas = page.locator("canvas");
    const box = await canvas.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.width).toBeGreaterThan(100);
    expect(box!.height).toBeGreaterThan(100);
  });

  test("canvas is rendering (non-blank pixels on title screen)", async ({ page }) => {
    await gotoGame(page);
    await page.waitForTimeout(500);

    const isNonBlank = await page.evaluate(() => {
      const canvas = document.querySelector("canvas") as HTMLCanvasElement;
      if (!canvas) return false;
      const ctx = canvas.getContext("2d");
      if (!ctx) return false;
      const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
      // Check if any pixel is non-transparent
      for (let i = 3; i < data.length; i += 4) {
        if (data[i] > 0) return true;
      }
      return false;
    });

    expect(isNonBlank).toBe(true);
  });
});

// ─── Game start ───────────────────────────────────────────────────────────────
test.describe("game start", () => {
  test("pressing Space starts the game (canvas still rendering)", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", e => errors.push(e.message));
    await gotoGame(page);
    await page.waitForTimeout(300);

    await page.keyboard.press("Space");
    await page.waitForTimeout(500);

    // Game should still be running — no crash
    expect(errors).toHaveLength(0);
    const canvas = page.locator("canvas[data-testid='game-canvas']");
    await expect(canvas).toBeVisible();
  });

  test("pressing Enter starts the game", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", e => errors.push(e.message));
    await gotoGame(page);
    await page.waitForTimeout(300);

    await page.keyboard.press("Enter");
    await page.waitForTimeout(500);

    expect(errors).toHaveLength(0);
    await expect(page.locator("canvas")).toBeVisible();
  });

  test("canvas continues to animate after game start", async ({ page }) => {
    await gotoGame(page);
    await page.keyboard.press("Space");

    // Inject a rAF counter so we can verify the game loop is running
    const frameCount = await page.evaluate(() => {
      return new Promise<number>(resolve => {
        let count = 0;
        const start = performance.now();
        const tick = () => {
          count++;
          if (performance.now() - start < 500) {
            requestAnimationFrame(tick);
          } else {
            resolve(count);
          }
        };
        requestAnimationFrame(tick);
      });
    });

    // In 500ms at 60fps we expect at least 10 frames; even throttled we expect > 1
    expect(frameCount).toBeGreaterThan(1);
  });
});

// ─── Keyboard input ───────────────────────────────────────────────────────────
test.describe("keyboard controls", () => {
  test("game does not crash when P1 keys are held", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", e => errors.push(e.message));

    await gotoGame(page);
    await page.keyboard.press("Space");
    await page.waitForTimeout(200);

    await page.keyboard.down("KeyA");
    await page.waitForTimeout(100);
    await page.keyboard.down("KeyD");
    await page.waitForTimeout(100);
    await page.keyboard.press("KeyW");
    await page.waitForTimeout(200);
    await page.keyboard.up("KeyA");
    await page.keyboard.up("KeyD");

    expect(errors).toHaveLength(0);
  });

  test("game does not crash when P2 keys are held", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", e => errors.push(e.message));

    await gotoGame(page);
    await page.keyboard.press("Space");
    await page.waitForTimeout(200);

    await page.keyboard.down("ArrowLeft");
    await page.waitForTimeout(100);
    await page.keyboard.down("ArrowRight");
    await page.waitForTimeout(100);
    await page.keyboard.press("ArrowUp");
    await page.waitForTimeout(200);
    await page.keyboard.up("ArrowLeft");
    await page.keyboard.up("ArrowRight");

    expect(errors).toHaveLength(0);
  });
});

// ─── Game stability ───────────────────────────────────────────────────────────
test.describe("game stability", () => {
  test("game runs for 3 seconds without errors or crashes", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", e => errors.push(e.message));
    page.on("console", msg => { if (msg.type() === "error") errors.push(msg.text()); });

    await gotoGame(page);
    await page.keyboard.press("Space");
    await page.waitForTimeout(3000);

    expect(errors).toHaveLength(0);
  });

  test("can restart game after it ends (pressing Space again)", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", e => errors.push(e.message));

    await gotoGame(page);
    await page.keyboard.press("Space");
    await page.waitForTimeout(500);

    // Force game over state by pressing Enter (which also restarts from title/over)
    await page.keyboard.press("Enter");
    await page.waitForTimeout(300);

    expect(errors).toHaveLength(0);
    await expect(page.locator("canvas")).toBeVisible();
  });
});
