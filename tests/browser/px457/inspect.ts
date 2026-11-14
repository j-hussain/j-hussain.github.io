/** Explicit isolated server; no configured 3000/3001 servers or shared test output. */
import { chromium, expect } from "@playwright/test";
import { mkdir, writeFile } from "node:fs/promises";
import { px457Order } from "../../../src/lib/px457";

async function main() {
    const baseURL = process.env.PX457_BASE_URL || "http://localhost:3457";
    const output = "artifacts/px457/browser";
    await mkdir(output, { recursive: true });
    const browser = await chromium.launch();
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
            const page = await context.newPage();
            const errors: string[] = [];
            page.on("pageerror", (e) => errors.push(e.message));
            page.on("console", (m) => {
                if (m.type() === "error" && /hydrat/i.test(m.text())) errors.push(m.text());
            });
            expect((await page.goto("/notes/px457"))?.status()).toBe(200);
            expect(await page.locator('article a[href^="/notes/px457/"]').count()).toBe(px457Order.length);
            for (const [i, slug] of px457Order.entries()) {
                expect((await page.goto(`/notes/px457/${slug}`))?.status()).toBe(200);
                await page.evaluate(() => document.fonts.ready);
                await expect(page.locator("h1")).toBeVisible();
                await expect(page.locator(".katex-error")).toHaveCount(0);
                const nav = page.getByRole("navigation", { name: "PX457 chapters", exact: true });
                if (i > 0) await expect(nav.locator(`a[href="/notes/px457/${px457Order[i - 1]}"]`)).toHaveCount(1);
                if (i < px457Order.length - 1)
                    await expect(nav.locator(`a[href="/notes/px457/${px457Order[i + 1]}"]`)).toHaveCount(1);
                else await expect(nav.getByRole("link", { name: "Next chapter →" })).toHaveCount(0);
                for (const width of mobile ? [390, 320] : [1440, 768]) {
                    await page.setViewportSize({ width, height: mobile ? 844 : 1000 });
                    expect(
                        await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
                        `${slug}: page overflow at ${width}`
                    ).toBeTruthy();
                    const bounds = await page
                        .locator("article figure,article table,article pre,.katex-display")
                        .evaluateAll((nodes) =>
                            nodes.flatMap((n) => {
                                const b = n.getBoundingClientRect();
                                return b.left < -0.5 || b.right > innerWidth + 0.5
                                    ? [n.tagName + ":" + b.left + "," + b.right]
                                    : [];
                            })
                        );
                    expect(bounds, `${slug}: overflowing content at ${width}`).toEqual([]);
                    const clipped = await page.locator("figure svg").evaluateAll((nodes) =>
                        nodes.flatMap((node) => {
                            const svg = node as SVGSVGElement,
                                view = svg.viewBox.baseVal;
                            return [...svg.querySelectorAll("text")].flatMap((t) => {
                                const b = t.getBBox();
                                return b.x < -1 ||
                                    b.y < -1 ||
                                    b.x + b.width > view.width + 1 ||
                                    b.y + b.height > view.height + 1
                                    ? [t.textContent]
                                    : [];
                            });
                        })
                    );
                    expect(clipped, `${slug}: clipped SVG labels`).toEqual([]);
                }
                await page.setViewportSize({ width: mobile ? 390 : 1440, height: mobile ? 844 : 1000 });
                const prediction = page.locator(".sci-prediction");
                if (await prediction.count()) {
                    const reveal = prediction.getByRole("button", { name: "Reveal result" });
                    await expect(reveal).toBeDisabled();
                    const correct = prediction.getByRole("radio").nth(1);
                    if (mobile) await correct.tap();
                    else {
                        await correct.focus();
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
                    await prediction.getByRole("radio").first().check();
                    await reveal.click();
                    await expect(prediction).toContainText("Compare your prediction with the result.");
                    await reset.click();
                }
                const ids = await page.locator("[id]").evaluateAll((nodes) => nodes.map((n) => n.id));
                expect(new Set(ids).size).toBe(ids.length);
                const mode = mobile ? "mobile" : "desktop";
                await page.screenshot({ path: `${output}/${slug}-${mode}.png`, fullPage: true });
                await page.evaluate(() => document.documentElement.classList.add("dark"));
                for (const [j, figure] of (await page.locator("figure").all()).entries())
                    await figure.screenshot({ path: `${output}/${slug}-${mode}-dark-${j}.png` });
                await page.evaluate(() => document.documentElement.classList.remove("dark"));
                report.push({
                    slug,
                    mode,
                    equations: await page.locator(".katex-display").count(),
                    figures: await page.locator("figure").count(),
                    overflow: false,
                    clipped: false,
                });
            }
            for (const [slug, anchor] of [
                ["intro-optimisation", "sum-order"],
                ["openmp-dependencies", "boundary-convergence"],
            ]) {
                await page.goto(`/notes/px457/${slug}#${anchor}`);
                await page.evaluate(() => document.fonts.ready);
                const heading = page.locator(`#${anchor}`);
                await expect(heading).toBeInViewport();
                expect(await heading.evaluate((node) => node.getBoundingClientRect().top)).toBeGreaterThanOrEqual(80);
            }
            expect(errors).toEqual([]);
            expect((await page.goto("/notes/px457/not-a-chapter"))?.status()).toBe(404);
            for (const removed of ["ml1", "ml2", "ml3", "ml4", "ml5"])
                expect((await page.goto(`/notes/px457/${removed}`))?.status()).toBe(404);
            await context.close();
        }
        const context = await browser.newContext({
            baseURL,
            javaScriptEnabled: false,
            viewport: { width: 390, height: 844 },
        });
        const page = await context.newPage();
        for (const slug of px457Order) {
            expect((await page.goto(`/notes/px457/${slug}`))?.status()).toBe(200);
            if (await page.locator("figure").count()) await expect(page.locator("figure svg").first()).toBeVisible();
            if (await page.locator(".sci-prediction").count())
                await expect(page.locator("noscript p").first()).toBeVisible();
        }
        expect((await page.goto("/notes/es98a/week1"))?.status()).toBe(200);
        expect((await page.goto("/dev/scientific-components"))?.status()).toBe(404);
        await context.close();
        await writeFile(
            `${output}/report.json`,
            JSON.stringify({ baseURL, report, noJavaScriptPages: px457Order.length }, null, 2)
        );
        console.log(
            `Passed ${2 * px457Order.length} chapter/viewport cases, ${px457Order.length} no-JS pages, two prediction flows, themes, bounds, navigation and route boundaries.`
        );
    } finally {
        await browser.close();
    }
}
main().catch((e) => {
    console.error(e);
    process.exitCode = 1;
});
