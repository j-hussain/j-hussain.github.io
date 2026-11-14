import { test, expect } from "@playwright/test";

test("Week 1 links prediction, projection and reference mathematics", async ({ page }, info) => {
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    page.on("console", (m) => {
        if (m.type() === "error" && /hydrat/i.test(m.text())) errors.push(m.text());
    });
    await page.goto("/notes/es98a/week1");
    await expect(page.locator("h1")).toContainText("From measurements to models");
    await expect(page.getByRole("button", { name: "Reveal result" })).toBeDisabled();
    await page.getByLabel("No: changing E affects the two predicted stresses differently").check();
    await page.getByRole("button", { name: "Reveal result" }).click();
    await expect(page.getByText("Your prediction agrees.")).toBeVisible();
    const plot = page.locator("#projection-experiment");
    await plot.getByRole("button", { name: "Reveal second component" }).click();
    await expect(plot.getByRole("status")).toContainText("4.000 + 1.000 = 5.000");
    const slider = plot.getByRole("slider");
    await slider.focus();
    await page.keyboard.press("End");
    await expect(slider).toHaveValue("180");
    await expect(plot.getByRole("status")).toContainText("α₁ = -2.000");
    await plot.getByRole("button", { name: "Calibration preset" }).click();
    await expect(plot).toContainText("(1.600, 3.200)");
    await expect(plot).toContainText("(0.400, -0.200)");
    await page.screenshot({ path: `artifacts/week1-${info.project.name}.png`, fullPage: true });
    await plot.screenshot({ path: `artifacts/week1-figure-${info.project.name}.png` });
    await plot.getByRole("button", { name: "Reset rulers" }).click();
    await expect(slider).toHaveValue("0");
    await expect(page.locator(".katex-error")).toHaveCount(0);
    expect(await page.locator(".katex-display").count()).toBeGreaterThan(20);
    for (const width of [320, 768, 1440]) {
        await page.setViewportSize({ width, height: 900 });
        const rect = await plot.boundingBox();
        expect(rect!.x).toBeGreaterThanOrEqual(0);
        expect(rect!.x + rect!.width).toBeLessThanOrEqual(width);
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBeTruthy();
    }
    expect(errors).toEqual([]);
});

test("module index, archived weeks, blog and home explanations", async ({ page }, info) => {
    test.setTimeout(90000);
    await page.goto("/notes");
    await page.getByRole("link", { name: "ES98A: Fundamentals of Predictive Modelling" }).click();
    await expect(page.locator(".sci-week-list a")).toHaveCount(10);
    for (let n = 1; n <= 10; n++) {
        expect(
            (await page.goto(`http://localhost:3001/notes/es98a/week${n}`, { waitUntil: "domcontentloaded" }))?.status()
        ).toBe(200);
        await expect(page.locator(".katex-error")).toHaveCount(0);
    }
    await page.goto("/notes/es98a/week9");
    for (const image of await page.locator("article img").all())
        expect(await image.evaluate((el: HTMLImageElement) => el.complete && el.naturalWidth > 0)).toBeTruthy();
    await page.goto("/about");
    await expect(page).toHaveURL(/\/blog$/);
    await expect(page.locator("h1")).toHaveText("Blog");
    await page.goto("/", { waitUntil: "domcontentloaded" });
    // Home's effect owns scroll locking. Wait for that hydration signal before
    // tapping server-rendered controls, and for fonts to settle their hit areas.
    await page.waitForFunction(() => document.documentElement.style.overflow === "hidden");
    await page.evaluate(() => document.fonts.ready);
    const fields = page
        .getByRole("button", { name: "Several different fields, Earlier work", exact: true })
        .filter({ visible: true });
    if (info.project.name === "mobile") await fields.tap();
    else await fields.hover();
    const card = page.locator(".citation-card");
    await expect(card).toContainText("AI Safety");
    await expect(card).toContainText("Palantir Winter Tech Fellow");
    await expect(card).toContainText("Automated deal screening/sourcing at Europe's leading fintech VC fund");
    await expect(card).toContainText("RL bots for intraday trading (BSc. thesis)");
    const box = await card.boundingBox();
    expect(box!.x).toBeGreaterThanOrEqual(0);
    expect(box!.y).toBeGreaterThanOrEqual(0);
    await expect
        .poll(() =>
            card.evaluate((el) => {
                let opacity = 1;
                for (let node: Element | null = el; node; node = node.parentElement)
                    opacity *= Number(getComputedStyle(node).opacity);
                return opacity;
            })
        )
        .toBeGreaterThan(0.99);
    await page.screenshot({ path: `artifacts/home-fields-${info.project.name}.png` });
    await page.keyboard.press("Escape");
    const research = page
        .getByRole("button", { name: "Multi-agent open-endedness, Research question", exact: true })
        .filter({ visible: true });
    if (info.project.name === "mobile") await research.tap();
    else await research.hover();
    await expect(page.locator(".citation-card")).toContainText(
        "agents endlessly co-evolving, competing, and collaborating to create novel complexity without a central goal."
    );
});

test("Week 1 works without JavaScript in production", async ({ browser }) => {
    const context = await browser.newContext({ javaScriptEnabled: false });
    const page = await context.newPage();
    await page.goto("http://localhost:3001/notes/es98a/week1");
    await expect(page.locator("#projection-experiment svg")).toBeVisible();
    for (const id of [
        "hooke-experiment",
        "model-families",
        "parseval-areas",
        "outer-product-story",
        "fit-as-projection",
        "adjoint-measurement",
        "positive-directions",
        "cholesky-steps",
    ]) {
        await expect(page.locator(`#${id} svg`).first()).toBeVisible();
    }
    await expect(page.locator("#hooke-experiment noscript p")).toContainText("Doubling");
    await expect(page.locator("#hooke-experiment noscript p")).toBeVisible();
    await expect(page.locator(".sci-prediction noscript p").first()).toBeVisible();
    await context.close();
});

test("Week 1 visual sequences and model controls work with pointer, keyboard and touch", async ({ page }, info) => {
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    await page.goto("/notes/es98a/week1");
    const hooke = page.locator("#hooke-experiment");
    const strain = hooke.getByRole("button", { name: "Strain 2", exact: true });
    if (info.project.name === "mobile") await strain.tap();
    else await strain.click();
    await expect(hooke.getByRole("status")).toHaveText("ε = 2 → σ = 4, with E = 2.");
    await hooke.getByRole("button", { name: "Strain 0", exact: true }).focus();
    await page.keyboard.press("Enter");
    await expect(hooke.getByRole("status")).toContainText("σ = 0");
    await hooke.getByRole("button", { name: "Strain 1", exact: true }).click();
    const models = page.locator("#model-families");
    const paths: string[] = [];
    for (const family of ["Linear", "Quadratic", "Fourier"]) {
        const button = models.getByRole("button", { name: family, exact: true });
        if (info.project.name === "mobile") await button.tap();
        else {
            await button.focus();
            await page.keyboard.press("Space");
        }
        await expect(button).toHaveAttribute("aria-pressed", "true");
        await expect(models.getByRole("status")).toContainText(family);
        paths.push((await models.locator("svg path.sci-stroke-ink").getAttribute("d"))!);
    }
    expect(new Set(paths).size).toBe(3);
    for (const id of [
        "hooke-experiment",
        "model-families",
        "parseval-areas",
        "outer-product-story",
        "fit-as-projection",
        "adjoint-measurement",
        "positive-directions",
        "cholesky-steps",
    ]) {
        const figure = page.locator(`#${id}`);
        await expect(figure).toHaveCount(1);
        await expect(figure.locator("figcaption")).toBeVisible();
        await figure.screenshot({ path: `artifacts/${id}-${info.project.name}.png` });
    }
    for (const width of [320, 768, 1100, 1440]) {
        await page.setViewportSize({ width, height: 900 });
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBeTruthy();
        for (const figure of await page.locator(".sci-figure").all()) {
            const box = await figure.boundingBox();
            expect(box!.x).toBeGreaterThanOrEqual(0);
            expect(box!.x + box!.width).toBeLessThanOrEqual(width);
        }
    }
    expect(errors).toEqual([]);
});
