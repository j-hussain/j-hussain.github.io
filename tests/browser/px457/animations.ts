/** Production-only module matrix. Supply an isolated server; never starts fixed shared ports. */
import { chromium, expect, type Locator, type Page } from "@playwright/test";
import { mkdir, writeFile } from "node:fs/promises";
import { animationCatalog, type AnimationId } from "../../../src/components/scientific/modules/px457/animation-catalog";
import { px457Order } from "../../../src/lib/px457";
const output = "artifacts/px457/animations";
async function seek(region: Locator, percent: number) {
    await region.getByRole("slider", { name: "Animation time" }).evaluate((input, value) => {
        const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")!.set!;
        setter.call(input, String(value));
        input.dispatchEvent(new Event("input", { bubbles: true }));
        input.dispatchEvent(new Event("change", { bubbles: true }));
    }, percent);
    await expect.poll(async () => Number(await region.getAttribute("data-progress"))).toBeCloseTo(percent / 100, 4);
}
async function bounds(page: Page, region: Locator, label: string) {
    const issues = await region.locator(".pxa-canvas").evaluateAll((nodes) =>
        nodes.flatMap((node) => {
            const svg = node as SVGSVGElement,
                v = svg.viewBox.baseVal;
            return [...svg.querySelectorAll("text")].flatMap((text) => {
                const b = text.getBBox();
                return b.x < -1 || b.y < -1 || b.x + b.width > v.width + 1 || b.y + b.height > v.height + 1
                    ? [`${text.textContent}: ${b.x},${b.y},${b.width},${b.height}`]
                    : [];
            });
        })
    );
    expect(issues, `${label}: SVG bounds`).toEqual([]);
    expect(
        await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
        `${label}: page overflow`
    ).toBeTruthy();
}
async function main() {
    await mkdir(output, { recursive: true });
    const browser = await chromium.launch(),
        baseURL = process.env.PX457_BASE_URL || "http://localhost:3457";
    const report: unknown[] = [];
    try {
        for (const mobile of [false, true]) {
            const context = await browser.newContext({
                baseURL,
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
            for (const slug of ["", ...px457Order]) {
                expect((await page.goto(`/notes/px457${slug ? `/${slug}` : ""}`))?.status()).toBe(200);
                await page.evaluate(() => document.fonts.ready);
                await expect(page.locator(".pxa-experiment")).toHaveCount(slug ? 2 : 0);
                await expect(page.locator(".katex-error")).toHaveCount(0);
                for (const region of await page.locator(".pxa-experiment").all()) {
                    const id = (await region.getAttribute("data-scene")) as AnimationId,
                        spec = animationCatalog[id];
                    await expect(region).toHaveAttribute("data-progress", "0.00000");
                    const step = region.getByRole("button", { name: "Next step", exact: true }),
                        restart = region.getByRole("button", { name: "Restart", exact: true });
                    if (mobile) await step.tap();
                    else {
                        await step.focus();
                        await page.keyboard.press("Enter");
                    }
                    expect(Number(await region.getAttribute("data-progress"))).toBeGreaterThan(0);
                    await restart.click();
                    const play = region.getByRole("button", { name: "Play animation", exact: true });
                    if (mobile) await play.tap();
                    else await play.click();
                    await expect
                        .poll(async () => Number(await region.getAttribute("data-progress")))
                        .toBeGreaterThan(0.005);
                    await region.getByRole("button", { name: "Pause animation", exact: true }).click();
                    const paused = await region.getAttribute("data-progress");
                    await page.waitForTimeout(70);
                    await expect(region).toHaveAttribute("data-progress", paused!);
                    await restart.click();
                    for (const comparison of [0, 1]) {
                        const choice = region.getByRole("button", { name: spec.choices[comparison], exact: true });
                        if (mobile) await choice.tap();
                        else await choice.click();
                        await expect(choice).toHaveAttribute("aria-pressed", "true");
                        await expect(region).toHaveAttribute("data-progress", "0.00000");
                        for (const percent of [0, 50, 100]) {
                            await seek(region, percent);
                            await bounds(page, region, `${id}/${mobile}/${comparison}/${percent}`);
                        }
                        await expect(step).toBeDisabled();
                        await seek(region, 50);
                        await page.evaluate((dark) => document.documentElement.classList.toggle("dark", dark), mobile);
                        await region.locator(".pxa-canvas").screenshot({
                            path: `${output}/${id}-${mobile ? "mobile-dark" : "desktop-light"}-${comparison}.png`,
                        });
                        await page.evaluate(() => document.documentElement.classList.remove("dark"));
                    }
                    const slider = region.getByRole("slider", { name: "Animation time" });
                    await slider.focus();
                    await page.keyboard.press("End");
                    await expect(region).toHaveAttribute("data-progress", "1.00000");
                    await page.keyboard.press("Home");
                    await expect(region).toHaveAttribute("data-progress", "0.00000");
                    await restart.click();
                    if (["rounding", "cache", "pipeline", "relaxation", "forward", "reverse"].includes(id))
                        await region.screenshot({
                            path: `${output}/${id}-${mobile ? "mobile" : "desktop"}-controls.png`,
                        });
                    report.push({
                        id,
                        slug: slug || "contents",
                        mobile,
                        playPause: true,
                        stepReset: true,
                        comparisons: 2,
                        scrubStates: 6,
                        svgBounds: true,
                    });
                }
                for (const width of [320, 768]) {
                    await page.setViewportSize({ width, height: mobile ? 844 : 1000 });
                    for (const region of await page.locator(".pxa-experiment").all())
                        await bounds(page, region, `${slug}/${width}`);
                }
                await page.setViewportSize({ width: mobile ? 390 : 1440, height: mobile ? 844 : 1000 });
                const ids = await page.locator("[id]").evaluateAll((nodes) => nodes.map((n) => n.id));
                expect(new Set(ids).size).toBe(ids.length);
            }
            await page.goto("/notes/px457/intro-hpc");
            const first = page.locator(".pxa-experiment").first();
            await first.getByRole("button", { name: "Play animation" }).click();
            await expect.poll(async () => Number(await first.getAttribute("data-progress"))).toBeGreaterThan(0);
            await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
            await expect(first).toHaveAttribute("data-playing", "false");
            expect(errors).toEqual([]);
            await context.close();
        }
        const reduced = await browser.newContext({
            baseURL,
            reducedMotion: "reduce",
            viewport: { width: 390, height: 844 },
        });
        const page = await reduced.newPage();
        for (const slug of ["", ...px457Order]) {
            await page.goto(`/notes/px457${slug ? `/${slug}` : ""}`);
            await expect(page.locator(".pxa-experiment")).toHaveCount(slug ? 2 : 0);
            for (const region of await page.locator(".pxa-experiment").all()) {
                await expect(region.getByRole("button", { name: "Play animation" })).toBeDisabled();
                await region.getByRole("button", { name: "Next step", exact: true }).click();
                expect(Number(await region.getAttribute("data-progress"))).toBeGreaterThan(0);
                await expect(region.locator(".pxa-motion-note")).toContainText("Reduced motion");
            }
        }
        await reduced.close();
        const nojs = await browser.newContext({
            baseURL,
            javaScriptEnabled: false,
            viewport: { width: 390, height: 844 },
        });
        const staticPage = await nojs.newPage();
        for (const slug of ["", ...px457Order]) {
            await staticPage.goto(`/notes/px457${slug ? `/${slug}` : ""}`);
            const regions = staticPage.locator(".pxa-experiment");
            await expect(regions).toHaveCount(slug ? 2 : 0);
            for (const region of await regions.all()) {
                await expect(region.locator("svg")).toBeVisible();
                await expect(region.locator("noscript p")).toBeVisible();
            }
        }
        await nojs.close();
        await writeFile(
            `${output}/report.json`,
            JSON.stringify({ baseURL, report, reducedMotionPages: 16, noJavaScriptPages: 16 }, null, 2)
        );
        console.log(
            "Passed 60 animated-view flows, both comparisons at 0/50/100%, keyboard/touch, bounds, 16 reduced-motion and 16 no-JavaScript pages; contents stays animation-free."
        );
    } finally {
        await browser.close();
    }
}
main().catch((e) => {
    console.error(e);
    process.exitCode = 1;
});
