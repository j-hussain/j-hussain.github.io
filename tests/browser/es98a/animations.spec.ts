import { test, expect } from "@playwright/test";

test("all twenty mathematical animations support scrub, playback, pause, reset and responsive reading", async ({
    page,
}, info) => {
    test.setTimeout(240000);
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    page.on("console", (m) => {
        if (m.type() === "error" && /hydrat/i.test(m.text())) errors.push(m.text());
    });
    for (let week = 1; week <= 10; week++) {
        expect((await page.goto(`/notes/es98a/week${week}`))?.status()).toBe(200);
        await expect(page.locator(".katex-error")).toHaveCount(0);
        const figures = page.locator("[data-es98a-animation]");
        await expect(figures).toHaveCount(2);
        const ids = await page.locator("[id]").evaluateAll((els) => els.map((e) => e.id));
        expect(new Set(ids).size).toBe(ids.length);
        for (const figure of await figures.all()) {
            const range = figure.getByRole("slider");
            await range.scrollIntoViewIfNeeded();
            await expect(range).toBeEnabled();
            const initial = await figure.locator("[data-animation-formula]").textContent();
            await range.focus();
            await range.press("End");
            await expect(figure).toHaveAttribute("data-position", "1.0000");
            expect(await figure.locator("[data-animation-formula]").textContent()).not.toBe(initial);
            for (const width of [320, 768, 1440]) {
                await page.setViewportSize({ width, height: 1000 });
                const box = await figure.boundingBox();
                expect(box!.x).toBeGreaterThanOrEqual(-1);
                expect(box!.x + box!.width).toBeLessThanOrEqual(width + 1);
                expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBeTruthy();
            }
            const clipped = await figure.locator("svg text").evaluateAll((els) =>
                els
                    .filter((el) => {
                        const b = (el as SVGTextElement).getBBox();
                        return b.x < -1 || b.y < -1 || b.x + b.width > 381 || b.y + b.height > 331;
                    })
                    .map((el) => el.textContent)
            );
            expect(clipped).toEqual([]);
            await page.setViewportSize(info.project.use.viewport!);
            const kind = await figure.getAttribute("data-es98a-animation");
            for (const theme of ["light", "dark"]) {
                await page.evaluate((t) => {
                    document.documentElement.classList.remove("light", "dark");
                    document.documentElement.classList.add(t);
                }, theme);
                await figure.screenshot({ path: `artifacts/es98a/animated-${kind}-${info.project.name}-${theme}.png` });
            }
            const restart = figure.getByRole("button", { name: "Restart", exact: true });
            if (info.project.name === "mobile") await restart.tap();
            else await restart.click();
            await expect(figure).toHaveAttribute("data-position", "0.0000");
            const play = figure.getByRole("button", { name: "Play animation", exact: true });
            if (info.project.name === "mobile") await play.tap();
            else await play.click();
            await expect.poll(async () => Number(await figure.getAttribute("data-position"))).toBeGreaterThan(0.01);
            await figure.getByRole("button", { name: "Pause animation", exact: true }).click();
            const stopped = await figure.getAttribute("data-position");
            await page.waitForTimeout(120);
            await expect(figure).toHaveAttribute("data-position", stopped!);
            await restart.click();
        }
    }
    expect(errors).toEqual([]);
});

test("reduced motion steps, completion/replay and leaving the viewport stop playback", async ({ page }) => {
    test.setTimeout(60000);
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/notes/es98a/week1");
    const figure = page.locator('[data-es98a-animation="feature-lift"]');
    await expect(figure.getByText("Reduced motion: playback advances in discrete steps.")).toBeVisible();
    await figure.getByRole("button", { name: "Play animation", exact: true }).click();
    await expect.poll(async () => Number(await figure.getAttribute("data-position"))).toBeGreaterThan(0);
    const position = Number(await figure.getAttribute("data-position"));
    expect(Math.abs(position * 18 - Math.round(position * 18))).toBeLessThan(0.002);
    await page.evaluate(() => scrollTo(0, 0));
    await expect(figure).toHaveAttribute("data-playing", "false");
    await figure.getByRole("slider").scrollIntoViewIfNeeded();
    await figure.getByRole("slider").focus();
    await figure.getByRole("slider").press("End");
    await expect(figure.getByRole("button", { name: "Replay animation", exact: true })).toBeVisible();
    await figure.getByRole("button", { name: "Replay animation", exact: true }).click();
    await expect(figure).toHaveAttribute("data-playing", "true");
    await expect(figure).toHaveAttribute("data-playing", "false", { timeout: 13000 });
    await expect(figure).toHaveAttribute("data-position", "1.0000");
    await expect(figure.getByRole("status")).toContainText("Animation complete");
    await figure.getByRole("button", { name: "Replay animation", exact: true }).click();
    await page.evaluate(() => {
        Object.defineProperty(document, "hidden", { value: true, configurable: true });
        document.dispatchEvent(new Event("visibilitychange"));
    });
    await expect(figure).toHaveAttribute("data-playing", "false");
    await page.evaluate(() => Reflect.deleteProperty(document, "hidden"));
});

test("all twenty animation views remain useful without JavaScript", async ({ browser, baseURL }) => {
    const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } });
    const page = await context.newPage();
    for (let week = 1; week <= 10; week++) {
        expect((await page.goto(`${baseURL}/notes/es98a/week${week}`))?.status(), `Week ${week} response`).toBe(200);
        const figures = page.locator("[data-es98a-animation]");
        await expect(figures).toHaveCount(2);
        for (const figure of await figures.all()) {
            await expect(figure.locator("svg")).toHaveCount(2);
            await expect(figure.locator("noscript p")).toBeVisible();
            await expect(figure.getByRole("slider")).toBeDisabled();
            await expect(figure.locator("[data-animation-formula]")).not.toBeEmpty();
        }
    }
    await context.close();
});

test("development gallery compiles all twenty working animation examples", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    expect((await page.goto("http://localhost:3000/notes/es98a/animations"))?.status()).toBe(200);
    await expect(page.locator("[data-es98a-animation]")).toHaveCount(20);
    const ids = await page.locator("[id]").evaluateAll((els) => els.map((e) => e.id));
    expect(new Set(ids).size).toBe(ids.length);
    await expect(page.locator(".katex-error")).toHaveCount(0);
    expect(errors).toEqual([]);
});

test("original pilot interactions remain functional alongside the animated additions", async ({ page }, info) => {
    await page.goto("/notes/es98a/week1");
    const feature = page.locator('[data-es98a-animation="feature-lift"]');
    await expect(feature.locator("figcaption")).toContainText("fixed oblique projection");
    await feature.getByRole("slider").focus();
    await feature.getByRole("slider").press("End");
    await feature.screenshot({
        path: `artifacts/es98a/animated-feature-lift-final-${info.project.name}.png`,
        style: ".sci-navigation { visibility: hidden; }",
    });
    await page.getByLabel("No: changing E affects the two predicted stresses differently").check();
    await page.getByRole("button", { name: "Reveal result", exact: true }).click();
    await expect(page.getByText("Your prediction agrees.")).toBeVisible();
    const projection = page.locator("#projection-experiment");
    await projection.getByRole("button", { name: "Calibration preset", exact: true }).click();
    await expect(projection).toContainText("(1.600, 3.200)");
    await page.goto("/notes/es98a/week2");
    await page.getByLabel("Along u₂", { exact: true }).check();
    await page.getByRole("button", { name: "Reveal result", exact: true }).click();
    await expect(page.getByText("Your prediction agrees.")).toBeVisible();
    const range = page.getByRole("slider", { name: "Smallest singular value" });
    await range.focus();
    await range.press("Home");
    await expect(range).toHaveValue("0.05");
    await expect(page.getByText(/Upper bound 0.1/)).toContainText("2.000");
    await page.getByRole("button", { name: "Next", exact: true }).click();
    await expect(page.getByText("Step 2 of 3")).toBeVisible();
});
