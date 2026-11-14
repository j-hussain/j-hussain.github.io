import { test, expect } from "@playwright/test";
import { es98eTopics } from "../../../src/lib/es98e";

const routes = ["", ...es98eTopics.map((t) => `/${t.slug}`)];
test("chapters have two working animations and the contents page has none", async ({ page }, testInfo) => {
    await page.addInitScript(() => localStorage.setItem("theme", "light"));
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    page.on("console", (m) => {
        if (m.type() === "error" && /hydrat|nesting|invalid/i.test(m.text())) errors.push(m.text());
    });
    for (const route of routes) {
        expect((await page.goto(`/notes/es98e${route}`))?.status()).toBe(200);
        const scenes = page.locator("[data-es98e-animation-kind]");
        await expect(scenes).toHaveCount(route === "" ? 0 : 2);
        await expect(page.locator(".katex-error")).toHaveCount(0);
        for (const scene of await scenes.all()) {
            const kind = await scene.getAttribute("data-es98e-animation-kind");
            await expect(scene).toHaveAttribute("data-playing", "false");
            await expect(scene).toHaveAttribute("data-progress", "0.0000");
            const timeline = scene.getByRole("slider").first();
            await expect(timeline).toBeEnabled();
            await timeline.fill("0.3");
            await expect(scene).toHaveAttribute("data-progress", "0.3000");
            const before = await scene.locator("svg").evaluate((e) => e.innerHTML);
            const play = scene.getByRole("button", { name: /^Play:/ });
            if (testInfo.project.name === "mobile") await play.tap();
            else {
                await play.focus();
                await page.keyboard.press("Space");
            }
            await expect(scene).toHaveAttribute("data-playing", "true");
            await expect.poll(async () => Number(await scene.getAttribute("data-progress"))).toBeGreaterThan(0.301);
            await scene.getByRole("button", { name: /^Pause:/ }).click();
            await expect(scene).toHaveAttribute("data-playing", "false");
            expect(await scene.locator("svg").evaluate((e) => e.innerHTML)).not.toBe(before);
            const paused = await scene.getAttribute("data-progress");
            await page.waitForTimeout(100);
            expect(await scene.getAttribute("data-progress")).toBe(paused);
            const sliders = scene.getByRole("slider");
            if ((await sliders.count()) > 1) {
                const parameter = sliders.nth(1),
                    max = await parameter.getAttribute("max");
                await parameter.fill(max!);
            } else {
                await scene.getByRole("button", { name: "Reverse node order" }).click();
                await expect(scene.getByRole("button", { name: "Reverse node order" })).toHaveAttribute(
                    "aria-pressed",
                    "true"
                );
            }
            await timeline.fill(kind === "residual-fit" ? "0.15" : "0.62");
            const clipping = await scene.locator("svg").evaluate((svg) => {
                const view = (svg as SVGSVGElement).viewBox.baseVal;
                return [...svg.querySelectorAll("text")]
                    .filter((t) => {
                        const b = t.getBBox();
                        return (
                            b.x < -1 || b.y < -1 || b.x + b.width > view.width + 1 || b.y + b.height > view.height + 1
                        );
                    })
                    .map((t) => t.textContent);
            });
            expect(clipping, `${route} ${kind}: clipped labels`).toEqual([]);
            const bounds = await scene.locator("svg").boundingBox();
            expect(bounds!.x).toBeGreaterThanOrEqual(0);
            expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(page.viewportSize()!.width + 1);
            // Hide fixed navigation only in the screenshot, preserving the tested page layout.
            const hide = await page.addStyleTag({
                content: ".sci-navigation, .fixed, nextjs-portal { visibility: hidden !important; }",
            });
            await page.evaluate(() => {
                document.documentElement.classList.remove("dark");
                document.documentElement.classList.add("light");
            });
            await scene
                .locator("svg")
                .screenshot({ path: `artifacts/es98e/animations/${testInfo.project.name}-${kind}-light.png` });
            await page.evaluate(() => {
                document.documentElement.classList.remove("light");
                document.documentElement.classList.add("dark");
            });
            await scene
                .locator("svg")
                .screenshot({ path: `artifacts/es98e/animations/${testInfo.project.name}-${kind}-dark.png` });
            await hide.evaluate((e) => e.parentNode?.removeChild(e));
            await scene.getByRole("button", { name: /^Replay:/ }).click();
            await expect(scene).toHaveAttribute("data-progress", "0.0000");
            await timeline.focus();
            await page.keyboard.press("End");
            await expect(scene).toHaveAttribute("data-progress", "1.0000");
            await page.keyboard.press("Home");
            await expect(scene).toHaveAttribute("data-progress", "0.0000");
        }
        const duplicate = await page.locator("[id]").evaluateAll((nodes) => {
            const ids = nodes.map((n) => n.id);
            return ids.filter((id, i) => ids.indexOf(id) !== i);
        });
        expect(duplicate).toEqual([]);
        const overflow = await page
            .locator("article p, article h2, article h3, article label")
            .evaluateAll((nodes) =>
                nodes.filter((e) => e.scrollWidth > e.clientWidth + 2).map((e) => e.textContent?.slice(0, 80))
            );
        expect(overflow).toEqual([]);
    }
    expect(errors).toEqual([]);
});

test("playback pauses offscreen and when another explanation starts", async ({ page }) => {
    await page.goto("/notes/es98e/regression");
    const scenes = page.locator("[data-es98e-animation-kind]"),
        first = scenes.first(),
        second = scenes.last();
    await first.getByRole("button", { name: /^Play:/ }).click();
    await expect(first).toHaveAttribute("data-playing", "true");
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
    await expect(first).toHaveAttribute("data-playing", "false");
    await first.getByRole("button", { name: /^Play:/ }).click();
    await second.getByRole("button", { name: /^Play:/ }).click();
    await expect(first).toHaveAttribute("data-playing", "false");
    await expect(second).toHaveAttribute("data-playing", "true");
    // Exercise the visibility-change contract without relying on headless tab focus.
    await page.evaluate(() => {
        Object.defineProperty(document, "hidden", { configurable: true, get: () => true });
        document.dispatchEvent(new Event("visibilitychange"));
    });
    await expect(second).toHaveAttribute("data-playing", "false");
    await page.evaluate(() => Reflect.deleteProperty(document, "hidden"));
});

test("reduced motion offers discrete steps and keeps scrubbing available", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/notes/es98e/regression");
    const scene = page.locator('[data-es98e-animation-kind="feature-lift"]');
    await scene.getByRole("button", { name: /^Step forward:/ }).click();
    await expect(scene).toHaveAttribute("data-progress", "0.1000");
    await expect(scene).toHaveAttribute("data-playing", "false");
    await page.waitForTimeout(150);
    await expect(scene).toHaveAttribute("data-progress", "0.1000");
    await scene.getByRole("slider").first().fill("0.75");
    await expect(scene).toHaveAttribute("data-progress", "0.7500");
    await expect(scene).toContainText("Reduced motion");
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await scene.getByRole("button", { name: /^Play:/ }).click();
    await expect(scene).toHaveAttribute("data-playing", "true");
    await page.emulateMedia({ reducedMotion: "reduce" });
    await expect(scene).toHaveAttribute("data-playing", "false");
    await expect(scene.getByRole("button", { name: /^Step forward:/ })).toBeVisible();
});

test("chapters retain two initial illustrations without JavaScript; the contents page has none", async ({
    browser,
    baseURL,
}, testInfo) => {
    const context = await browser.newContext({ javaScriptEnabled: false, viewport: testInfo.project.use.viewport });
    const page = await context.newPage();
    for (const route of routes) {
        await page.goto(`${baseURL}/notes/es98e${route}`);
        const scenes = page.locator("[data-es98e-animation-kind]");
        await expect(scenes).toHaveCount(route === "" ? 0 : 2);
        for (const scene of await scenes.all()) {
            await expect(scene.getByRole("img")).toBeVisible();
            await expect(scene.getByRole("button").first()).toBeDisabled();
            await expect(scene.locator("noscript p")).toContainText("initial illustration");
        }
    }
    await context.close();
});
