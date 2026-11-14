import { test, expect } from "@playwright/test";

test("pilot mathematics, controls, links and responsive geometry", async ({ page }, testInfo) => {
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    page.on("console", (message) => {
        if (message.type() === "error" && /hydrat/i.test(message.text())) errors.push(message.text());
    });
    await page.goto("/notes/es98a/week2");
    await expect(page.locator("h1")).toContainText("Week 2");
    expect(await page.locator(".katex").count()).toBeGreaterThan(40);
    expect(await page.locator(".katex-display").count()).toBeGreaterThan(20);
    await expect(page.locator(".katex-error")).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Reveal result" })).toBeDisabled();
    await page.getByLabel("Along u₂", { exact: true }).check();
    await page.getByRole("button", { name: "Reveal result" }).click();
    await expect(page.getByText("Your prediction agrees.")).toBeVisible();
    await page.getByRole("button", { name: "Reset prediction" }).click();
    await expect(page.getByText("Your prediction agrees.")).toHaveCount(0);
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.screenshot({ path: `artifacts/article-${testInfo.project.name}.png` });
    const slider = page.getByRole("slider", { name: "Smallest singular value" });
    await slider.focus();
    await page.keyboard.press("Home");
    await expect(slider).toHaveValue("0.05");
    await expect(page.getByText(/Upper bound 0.1/)).toContainText("2.000");
    await page.getByRole("button", { name: "Next", exact: true }).click();
    await expect(page.getByText("Step 2 of 3")).toBeVisible();
    await page.getByRole("button", { name: "Reset steps" }).click();
    await expect(page.getByText("Step 1 of 3")).toBeVisible();
    await page.getByRole("button", { name: "σᵢ", exact: true }).click();
    await expect(page.locator(".sci-linked-mark[data-active=true]")).toHaveText("scale that coordinate by σᵢ");
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBeTruthy();
    for (const figure of await page.locator("figure").all()) {
        const box = await figure.boundingBox();
        expect(box!.x).toBeGreaterThanOrEqual(0);
        expect(box!.x + box!.width).toBeLessThanOrEqual(testInfo.project.use.viewport!.width);
    }
    await page.locator("#inverse-noise").scrollIntoViewIfNeeded();
    await page.screenshot({ path: `artifacts/scientific-${testInfo.project.name}.png`, fullPage: true });
    await page.locator("#inverse-noise").screenshot({ path: `artifacts/figure-${testInfo.project.name}.png` });
    await page.evaluate(() => document.documentElement.classList.replace("dark", "light"));
    await page.locator("#inverse-noise").screenshot({ path: `artifacts/figure-${testInfo.project.name}-light.png` });
    expect(errors).toEqual([]);
});

test("gallery uses real MDX, definitions and footnote backlinks", async ({ page }, testInfo) => {
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    page.on("console", (message) => {
        if (message.type() === "error" && /hydrat|cannot be a descendant/i.test(message.text()))
            errors.push(message.text());
    });
    await page.goto("http://localhost:3000/dev/scientific-components");
    const term = page.getByRole("button", { name: "condition number" });
    await term.focus();
    await expect(page.getByRole("tooltip")).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.getByRole("tooltip")).toBeHidden();
    if (testInfo.project.name === "mobile") await term.tap();
    else await term.click();
    await expect(page.getByRole("tooltip")).toBeVisible();
    const steps = page.locator(".sci-stepper").filter({ hasText: "Measure the first coordinate" });
    await steps.getByRole("button", { name: "Next", exact: true }).click();
    await expect(steps.getByRole("status")).toHaveText("Step 2 of 3");
    await steps.getByRole("button", { name: "Reset steps", exact: true }).click();
    await expect(steps.getByRole("status")).toHaveText("Step 1 of 3");
    const prediction = page.locator(".sci-prediction").filter({ hasText: "A unit vector u defines" });
    await prediction.getByLabel("It stays Px", { exact: true }).check();
    await prediction.getByRole("button", { name: "Reveal result", exact: true }).click();
    await expect(prediction).toContainText("Your prediction agrees.");
    const linked = page.getByRole("button", { name: "P² = P", exact: true });
    await linked.focus();
    await expect(linked).toHaveAttribute("aria-pressed", "true");
    await page.keyboard.press("Escape");
    await expect(linked).toHaveAttribute("aria-pressed", "false");
    await expect(page.locator("[data-footnote-ref]")).toHaveCount(1);
    await expect(page.locator("[data-footnote-backref]")).toHaveCount(1);
    expect(errors).toEqual([]);
});

test("article remains useful without JavaScript", async ({ browser }) => {
    const context = await browser.newContext({ javaScriptEnabled: false });
    const page = await context.newPage();
    await page.goto("http://localhost:3001/notes/es98a/week2");
    // Playwright's text engine excludes noscript; inspect its rendered children.
    await expect(page.locator(".sci-prediction noscript p").first()).toBeVisible();
    await expect(page.locator(".sci-prediction noscript p").first()).toHaveText("Result (JavaScript is unavailable):");
    await expect(page.locator("#inverse-noise svg")).toHaveCount(2);
    const blocked = await page.goto("http://localhost:3001/dev/scientific-components");
    expect(blocked?.status()).toBe(404);
    await context.close();
});

test("narrow layouts, touch and existing routes", async ({ page }) => {
    for (const width of [320, 768, 1100, 1440]) {
        await page.setViewportSize({ width, height: 900 });
        await page.goto("/notes/es98a/week2");
        const note = await page.locator(".sci-sidenote").boundingBox();
        expect(note!.x).toBeGreaterThanOrEqual(0);
        expect(note!.x + note!.width).toBeLessThanOrEqual(width);
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBeTruthy();
    }
    for (const route of ["/", "/work", "/notes"])
        expect((await page.goto(route, { waitUntil: "domcontentloaded" }))?.status()).toBe(200);
    for (const route of ["/projects", "/projects/legacy-project"]) {
        await page.goto(route);
        await expect(page).toHaveURL(/\/work$/);
        await expect(page.locator("main")).toContainText("coming soon.");
    }
});
