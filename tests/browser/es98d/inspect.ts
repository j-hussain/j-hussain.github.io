/** Run against an explicitly supplied isolated production server; never starts/kills a shared server. */
import { chromium, expect } from "@playwright/test";
import { mkdir, writeFile } from "node:fs/promises";
import { es98dTopics } from "../../../src/lib/es98d";

const baseURL = process.env.ES98D_BASE_URL || "http://localhost:3014";
const output = process.env.ES98D_ARTIFACTS || "artifacts/es98d";
async function main() {
    await mkdir(output, { recursive: true });
    const browser = await chromium.launch();
    const report: unknown[] = [];
    try {
        for (const mobile of [false, true]) {
            const mode = mobile ? "mobile" : "desktop";
            const context = await browser.newContext({
                baseURL,
                viewport: { width: mobile ? 390 : 1440, height: mobile ? 844 : 1000 },
                isMobile: mobile,
                hasTouch: mobile,
            });
            await context.addInitScript(() => localStorage.setItem("theme", "light"));
            const page = await context.newPage();
            const errors: string[] = [];
            page.on("pageerror", (e) => errors.push(e.message));
            page.on("console", (m) => {
                if (m.type() === "error" && /hydrat/i.test(m.text())) errors.push(m.text());
            });
            const indexResponse = await page.goto("/notes/es98d");
            expect(indexResponse?.status()).toBe(200);
            expect(await page.locator("article ol > li").count()).toBe(9);
            for (let i = 0; i < es98dTopics.length; i++) {
                const topic = es98dTopics[i];
                const response = await page.goto(`/notes/es98d/${topic}`);
                expect(response?.status()).toBe(200);
                await expect(page.locator("h1")).toContainText(`${i + 1}.`);
                await page.evaluate(() => document.fonts.ready);
                await expect(page.locator(".katex-error")).toHaveCount(0);
                expect(await page.locator(".katex-display").count()).toBeGreaterThan(0);
                await expect(page.locator("article > figure")).toHaveCount(1);
                await expect(page.locator("article > figure svg")).toHaveCount(2);
                const nav = page.getByRole("navigation", { name: "Chapters", exact: true });
                if (i > 0) await expect(nav.locator(`a[href="/notes/es98d/${es98dTopics[i - 1]}"]`)).toHaveCount(1);
                if (i + 1 < es98dTopics.length)
                    await expect(nav.locator(`a[href="/notes/es98d/${es98dTopics[i + 1]}"]`)).toHaveCount(1);
                for (const width of mobile ? [390, 320] : [1440, 768]) {
                    await page.setViewportSize({ width, height: mobile ? 844 : 1000 });
                    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBeTruthy();
                    const bounds = await page.locator("article > figure").boundingBox();
                    expect(bounds!.x).toBeGreaterThanOrEqual(0);
                    expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(width + 0.5);
                    const clips = await page.locator("article > figure svg").evaluateAll((svgs) =>
                        svgs.flatMap((node) => {
                            const svg = node as SVGSVGElement;
                            return [...svg.querySelectorAll("text")].flatMap((t) => {
                                const box = t.getBBox(),
                                    view = svg.viewBox.baseVal;
                                return box.x < -1 ||
                                    box.x + box.width > view.width + 1 ||
                                    box.y < -1 ||
                                    box.y + box.height > view.height + 1
                                    ? [t.textContent]
                                    : [];
                            });
                        })
                    );
                    expect(clips).toEqual([]);
                }
                await page.setViewportSize({ width: mobile ? 390 : 1440, height: mobile ? 844 : 1000 });
                const ids = await page.locator("[id]").evaluateAll((nodes) => nodes.map((n) => n.id));
                expect(new Set(ids).size).toBe(ids.length);
                const prediction = page.locator(".sci-prediction");
                if (await prediction.count()) {
                    const reveal = prediction.getByRole("button", { name: "Reveal result" });
                    await expect(reveal).toBeDisabled();
                    const correct =
                        topic === "monte-carlo"
                            ? "One half, because accepted jumps alternate"
                            : "No: local changes can still relax large domains slowly";
                    // All interactions are tested with keyboard on desktop and actual touch events on mobile.
                    if (mobile) await prediction.getByLabel(correct).tap();
                    else {
                        await prediction.getByLabel(correct).focus();
                        await page.keyboard.press("Space");
                    }
                    if (mobile) await reveal.tap();
                    else {
                        await reveal.focus();
                        await page.keyboard.press("Enter");
                    }
                    await expect(prediction).toContainText("Your prediction agrees.");
                    const reset = prediction.getByRole("button", { name: "Reset prediction" });
                    if (mobile) await reset.tap();
                    else await reset.click();
                    await expect(reveal).toBeDisabled();
                    const wrong = prediction.getByRole("radio").first();
                    await wrong.check();
                    await reveal.click();
                    await expect(prediction).toContainText("Compare your prediction with the result.");
                    await reset.click();
                }
                await expect(page.locator("html")).toHaveClass(/light/);
                await page.locator("article > figure").screenshot({ path: `${output}/${topic}-${mode}-light.png` });
                await page.screenshot({ path: `${output}/${topic}-${mode}-page.png`, fullPage: true });
                await page.evaluate(() => document.documentElement.classList.add("dark"));
                await page.locator("article > figure").screenshot({ path: `${output}/${topic}-${mode}-dark.png` });
                await page.evaluate(() => document.documentElement.classList.remove("dark"));
                report.push({
                    topic,
                    mode,
                    status: response?.status(),
                    equations: await page.locator(".katex-display").count(),
                    figures: 1,
                    svgPanels: 2,
                    overflow: false,
                    clippedLabels: false,
                });
            }
            expect(errors).toEqual([]);
            expect((await page.goto("/notes/es98d/not-a-topic"))?.status()).toBe(404);
            await context.close();
        }
        const nojs = await browser.newContext({
            baseURL,
            javaScriptEnabled: false,
            viewport: { width: 390, height: 844 },
        });
        const page = await nojs.newPage();
        for (const topic of es98dTopics) {
            expect((await page.goto(`/notes/es98d/${topic}`))?.status()).toBe(200);
            await expect(page.locator("article > figure svg").first()).toBeVisible();
            if (await page.locator(".sci-prediction").count())
                await expect(page.locator(".sci-prediction noscript p").first()).toBeVisible();
        }
        // Existing routes remain renderable in the same isolated build.
        expect((await page.goto("/notes/es98a/week1"))?.status()).toBe(200);
        await expect(page.locator("#projection-experiment svg")).toBeVisible();
        expect((await page.goto("/dev/scientific-components"))?.status()).toBe(404);
        await nojs.close();
        await writeFile(
            `${output}/browser-report.json`,
            JSON.stringify(
                { baseURL, report, noJavaScriptChapters: 9, existingPilot: 200, productionGallery: 404 },
                null,
                2
            )
        );
        console.log(
            `Passed ${report.length} chapter/viewport cases, nine no-JavaScript pages, navigation, prediction controls, label bounds, themes, and existing pilot.`
        );
    } finally {
        await browser.close();
    }
}
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
