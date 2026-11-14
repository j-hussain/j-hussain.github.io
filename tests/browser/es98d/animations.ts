import { chromium, expect } from "@playwright/test";
import { mkdir, writeFile } from "node:fs/promises";
import { es98dTopics } from "../../../src/lib/es98d";
const url = process.env.ES98D_BASE_URL || "http://localhost:3000";
const output = process.env.ES98D_ARTIFACTS || "artifacts/es98d/animations";
async function main() {
    await mkdir(output, { recursive: true });
    const browser = await chromium.launch();
    const report: unknown[] = [];
    try {
        for (const mobile of [false, true]) {
            const context = await browser.newContext({
                viewport: { width: mobile ? 390 : 1440, height: mobile ? 844 : 1000 },
                isMobile: mobile,
                hasTouch: mobile,
            });
            await context.addInitScript(() => localStorage.setItem("theme", "light"));
            const page = await context.newPage(),
                errors: string[] = [];
            page.on("pageerror", (e) => errors.push(e.message));
            page.on("console", (m) => {
                if (m.type() === "error" && /hydrat/i.test(m.text())) errors.push(m.text());
            });
            for (const topic of ["", ...es98dTopics]) {
                expect((await page.goto(`${url}/notes/es98d${topic ? `/${topic}` : ""}`))?.status()).toBe(200);
                await page.evaluate(() => document.fonts.ready);
                const animations = page.locator("[data-es98d-animation]");
                await expect(animations).toHaveCount(topic ? 2 : 0);
                if (!topic) {
                    await expect(page.locator("article > blockquote")).toContainText("David L. Goodstein");
                    await expect(page.locator("article ol > li")).toHaveCount(9);
                }
                await expect(page.locator(".katex-error")).toHaveCount(0);
                for (const animation of await animations.all()) {
                    const kind = await animation.getAttribute("data-es98d-animation"),
                        mode = mobile ? "mobile" : "desktop",
                        name = `${topic || "index"}-${kind}-${mode}`;
                    await animation.scrollIntoViewIfNeeded();
                    await expect(animation).toHaveAttribute("data-playing", "false");
                    const initial = await animation.getAttribute("data-progress");
                    await page.waitForTimeout(120);
                    expect(await animation.getAttribute("data-progress")).toBe(initial);
                    const play = animation.getByRole("button", { name: "Play", exact: true });
                    if (mobile) await play.tap();
                    else {
                        await play.focus();
                        await page.keyboard.press("Enter");
                    }
                    await expect
                        .poll(async () => Number(await animation.getAttribute("data-progress")))
                        .toBeGreaterThan(Number(initial));
                    const pause = animation.getByRole("button", { name: "Pause", exact: true });
                    if (mobile) await pause.tap();
                    else await pause.click();
                    await expect(animation).toHaveAttribute("data-playing", "false");
                    const paused = await animation.getAttribute("data-progress");
                    await page.waitForTimeout(120);
                    expect(await animation.getAttribute("data-progress")).toBe(paused);
                    await animation.getByRole("button", { name: "Step forward", exact: true }).click();
                    expect(Number(await animation.getAttribute("data-progress"))).toBeGreaterThan(Number(paused));
                    await animation.getByRole("button", { name: "Restart", exact: true }).click();
                    await expect(animation).toHaveAttribute("data-progress", "0.0000");
                    const position = animation.getByRole("slider", { name: "Animation position", exact: true });
                    await position.focus();
                    await position.press("End");
                    await expect(animation).toHaveAttribute("data-progress", "1.0000");
                    await expect(animation.getByRole("status")).toContainText("complete");
                    const parameter = animation.getByRole("slider").nth(1);
                    await parameter.focus();
                    await parameter.press("End");
                    await expect(animation).toHaveAttribute("data-progress", "0.0000");
                    await parameter.press("Home");
                    await parameter.press("ArrowRight");
                    // Use the timeline as an actual pointer control to inspect a middle frame.
                    const bounds = await position.boundingBox();
                    if (mobile)
                        await page.touchscreen.tap(bounds!.x + bounds!.width * 0.63, bounds!.y + bounds!.height / 2);
                    else await page.mouse.click(bounds!.x + bounds!.width * 0.63, bounds!.y + bounds!.height / 2);
                    expect(Number(await animation.getAttribute("data-progress"))).toBeGreaterThan(0.4);
                    expect(Number(await animation.getAttribute("data-progress"))).toBeLessThan(0.8);
                    for (const width of mobile ? [390, 320] : [1440, 768]) {
                        await page.setViewportSize({ width, height: mobile ? 844 : 1000 });
                        expect(
                            await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)
                        ).toBeTruthy();
                        const rect = await animation.boundingBox();
                        expect(rect!.x).toBeGreaterThanOrEqual(0);
                        expect(rect!.x + rect!.width).toBeLessThanOrEqual(width + 0.5);
                        const clips = await animation.locator("svg text").evaluateAll((nodes) =>
                            nodes.flatMap((node) => {
                                const t = node as SVGGraphicsElement,
                                    box = t.getBBox(),
                                    svg = t.ownerSVGElement!,
                                    view = svg.viewBox.baseVal;
                                return box.x < -0.5 ||
                                    box.y < -0.5 ||
                                    box.x + box.width > view.width + 0.5 ||
                                    box.y + box.height > view.height + 0.5
                                    ? [t.textContent]
                                    : [];
                            })
                        );
                        expect(clips, `${kind}: labels clipped`).toEqual([]);
                    }
                    await page.setViewportSize({ width: mobile ? 390 : 1440, height: mobile ? 844 : 1000 });
                    await animation.screenshot({ path: `${output}/${name}-light.png` });
                    await page.evaluate(() => document.documentElement.classList.add("dark"));
                    await animation.screenshot({ path: `${output}/${name}-dark.png` });
                    await page.evaluate(() => document.documentElement.classList.remove("dark"));
                    report.push({
                        topic: topic || "index",
                        kind,
                        mode,
                        playPauseStepRestart: true,
                        parameter: true,
                        scrubbing: true,
                        overflow: false,
                        clippedLabels: false,
                    });
                }
                const ids = await page.locator("[id]").evaluateAll((nodes) => nodes.map((n) => n.id));
                expect(new Set(ids).size).toBe(ids.length);
            }
            expect(errors).toEqual([]);
            await context.close();
        }
        const reduced = await browser.newContext({ reducedMotion: "reduce", viewport: { width: 390, height: 844 } }),
            rp = await reduced.newPage();
        await rp.goto(`${url}/notes/es98d/equilibrium`);
        for (const animation of await rp.locator("[data-es98d-animation]").all()) {
            await expect(animation.getByRole("button", { name: "Play", exact: true })).toBeDisabled();
            await expect(animation.getByRole("status")).toContainText("Reduced motion");
            const p = Number(await animation.getAttribute("data-progress"));
            await animation.getByRole("button", { name: "Step forward", exact: true }).click();
            expect(Number(await animation.getAttribute("data-progress"))).toBeGreaterThan(p);
        }
        await reduced.close();
        const nojs = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } }),
            np = await nojs.newPage();
        for (const topic of ["", ...es98dTopics]) {
            await np.goto(`${url}/notes/es98d${topic ? `/${topic}` : ""}`);
            await expect(np.locator("[data-es98d-animation]")).toHaveCount(topic ? 2 : 0);
            for (const a of await np.locator("[data-es98d-animation]").all()) {
                await expect(a.locator("svg")).toHaveCount(2);
                await expect(a.locator("noscript p")).toBeVisible();
                expect((await a.locator("[data-motion-readout]").innerText()).length).toBeGreaterThan(20);
            }
        }
        await nojs.close();
        await writeFile(
            `${output}/report.json`,
            JSON.stringify({ url, report, reducedMotion: true, noJavaScriptPages: 10 }, null, 2)
        );
        console.log(
            `Passed ${report.length} animation/viewport cases, all controls, themes, 10 SSR pages and reduced motion.`
        );
    } finally {
        await browser.close();
    }
}
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
