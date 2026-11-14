import { test, expect } from "@playwright/test";

test("ES98A complete course: mathematics, anchors and responsive figures", async ({ page }, info) => {
    test.setTimeout(120000);
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    for (let week = 1; week <= 10; week++) {
        expect((await page.goto(`http://localhost:3001/notes/es98a/week${week}`))?.status()).toBe(200);
        await expect(page.locator("article")).toBeVisible();
        await expect(page.locator(".katex-error")).toHaveCount(0);
        const ids = await page.locator("[id]").evaluateAll((els) => els.map((e) => e.id));
        expect(new Set(ids).size).toBe(ids.length);
        const missing = await page
            .locator('article a[href^="#"]')
            .evaluateAll((els) =>
                els
                    .map((e) => e.getAttribute("href")!)
                    .filter((href) => !document.getElementById(decodeURIComponent(href.slice(1))))
            );
        expect(missing).toEqual([]);
        for (const width of [320, 768, 1440]) {
            await page.setViewportSize({ width, height: 900 });
            for (const figure of await page.locator("figure").all()) {
                const box = await figure.boundingBox();
                expect(box!.x).toBeGreaterThanOrEqual(-1);
                expect(box!.x + box!.width).toBeLessThanOrEqual(width + 1);
            }
            expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBeTruthy();
        }
        const clipping = await page.locator('figure[id^="es98a-"] svg').evaluateAll((svgs) =>
            svgs.flatMap((svg) =>
                Array.from(svg.querySelectorAll("text"))
                    .filter((text) => {
                        const box = text.getBBox();
                        return (
                            box.x < -1 ||
                            box.y < -1 ||
                            box.x + box.width > Number(svg.getAttribute("viewBox")!.split(" ")[2]) + 1 ||
                            box.y + box.height > Number(svg.getAttribute("viewBox")!.split(" ")[3]) + 1
                        );
                    })
                    .map((text) => text.textContent)
            )
        );
        expect(clipping).toEqual([]);
        await page.setViewportSize(info.project.use.viewport!);
        for (const theme of ["light", "dark"]) {
            await page.evaluate((value) => {
                document.documentElement.classList.remove("light", "dark");
                document.documentElement.classList.add(value);
            }, theme);
            for (const figure of await page.locator('figure[id^="es98a-"]').all())
                await figure.screenshot({ path: `artifacts/es98a/week${week}-${info.project.name}-${theme}.png` });
        }
    }
    expect(errors).toEqual([]);
});

test("ES98A new figures and derivations remain readable without JavaScript", async ({ browser }) => {
    const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } });
    const page = await context.newPage();
    for (let week = 3; week <= 10; week++) {
        await page.goto(`http://localhost:3001/notes/es98a/week${week}`);
        await expect(page.locator('figure[id^="es98a-"]:not([id^="es98a-animated-"]) svg')).toHaveCount(2);
        await expect(page.locator('figure[id^="es98a-"]:not([id^="es98a-animated-"]) figcaption')).toBeVisible();
        await expect(page.locator(".katex-error")).toHaveCount(0);
    }
    await context.close();
});
