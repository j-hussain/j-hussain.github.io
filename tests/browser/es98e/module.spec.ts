import { test, expect } from "@playwright/test";
import { es98eTopics } from "../../../src/lib/es98e";

const base = "/notes/es98e";

test("module index orders all eight chapters with Part B first", async ({ page }) => {
    await page.goto(base);
    const links = page.locator("article ol a");
    await expect(links).toHaveCount(8);
    expect(await links.evaluateAll((nodes) => nodes.map((n) => n.getAttribute("href")))).toEqual(
        es98eTopics.map((c) => `${base}/${c.slug}`)
    );
    const headings = await page.locator("article h2").allTextContents();
    expect(headings).toEqual(["Sensitivity and probabilistic regression", "Neural models and inference"]);
});

test("all chapters render, navigate, and keep equations and diagrams readable", async ({ page }, testInfo) => {
    await page.addInitScript(() => localStorage.setItem("theme", "light"));
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    page.on("console", (m) => {
        if (m.type() === "error" && /hydration|invalid|nesting/i.test(m.text())) errors.push(m.text());
    });
    for (const [index, topic] of es98eTopics.entries()) {
        const response = await page.goto(`${base}/${topic.slug}`);
        await page.evaluate(() => {
            document.documentElement.classList.remove("dark");
            document.documentElement.classList.add("light");
        });
        expect(response?.status()).toBe(200);
        await expect(page.locator("h1")).toContainText(`${index + 1}.`);
        await expect(page.locator("header")).toContainText(`Part ${topic.part}`);
        expect(await page.locator(".katex").count()).toBeGreaterThan(3);
        await expect(page.locator(".katex-error")).toHaveCount(0);
        const nav = page.getByRole("navigation", { name: "Chapters" });
        await expect(nav.locator("a")).toHaveCount(index === 0 || index === 7 ? 1 : 2);
        if (index > 0)
            await expect(nav.locator("a").first()).toHaveAttribute("href", `${base}/${es98eTopics[index - 1].slug}`);
        if (index < 7)
            await expect(nav.locator("a").last()).toHaveAttribute("href", `${base}/${es98eTopics[index + 1].slug}`);
        const proseOverflow = await page
            .locator("article p, article li, article h2, article h3, header h1")
            .evaluateAll((nodes) =>
                nodes.filter((n) => n.scrollWidth > n.clientWidth + 2).map((n) => n.textContent?.slice(0, 90))
            );
        expect(proseOverflow, `${topic.slug} prose overflow`).toEqual([]);
        const duplicateIds = await page.evaluate(() => {
            const ids = [...document.querySelectorAll("[id]")].map((e) => e.id);
            return ids.filter((v, i) => ids.indexOf(v) !== i);
        });
        expect(duplicateIds).toEqual([]);
        const badFragments = await page
            .locator('article a[href^="#"]')
            .evaluateAll((nodes) =>
                nodes
                    .map((n) => n.getAttribute("href")!)
                    .filter((h) => !document.getElementById(decodeURIComponent(h.slice(1))))
            );
        expect(badFragments).toEqual([]);
        const figures = page.locator("svg[data-es98e-diagram]");
        for (const figure of await figures.all()) {
            await figure.scrollIntoViewIfNeeded();
            const box = await figure.boundingBox();
            expect(box!.x).toBeGreaterThanOrEqual(0);
            expect(box!.x + box!.width).toBeLessThanOrEqual(page.viewportSize()!.width + 1);
            const clipped = await figure.evaluate((svg) => {
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
            expect(clipped, `${topic.slug} clipped SVG text`).toEqual([]);
            const name = await figure.getAttribute("data-es98e-diagram");
            expect(await figure.evaluate((e) => getComputedStyle(e).getPropertyValue("--sci-accent").trim())).toBe(
                "#39736e"
            );
            await figure.screenshot({ path: `artifacts/es98e/${testInfo.project.name}-${name}-light.png` });
            await page.evaluate(() => {
                document.documentElement.classList.remove("light");
                document.documentElement.classList.add("dark");
            });
            expect(await figure.evaluate((e) => getComputedStyle(e).getPropertyValue("--sci-accent").trim())).toBe(
                "#92c8bd"
            );
            await figure.screenshot({ path: `artifacts/es98e/${testInfo.project.name}-${name}-dark.png` });
            await page.evaluate(() => {
                document.documentElement.classList.remove("dark");
                document.documentElement.classList.add("light");
            });
        }
        if (topic.slug === "gaussian-processes") {
            await page.locator("#es98e-gp-conditioning figcaption a").click();
            await expect
                .poll(() => page.locator("#es98e-gp-conditioning").evaluate((e) => e.getBoundingClientRect().top))
                .toBeGreaterThanOrEqual(95);
        }
    }
    expect(errors).toEqual([]);
});

test("prediction supports keyboard or touch, reveal and reset", async ({ page }, testInfo) => {
    for (const item of [
        {
            slug: "regression",
            label: "No: the new observation has its own noise",
            explanation: "Interpolation constrains predictions",
        },
        {
            slug: "sensitivity",
            label: "No: curvature or interactions can still contribute",
            explanation: "The local linear response vanishes",
        },
    ]) {
        await page.goto(`${base}/${item.slug}`);
        const prediction = page.locator(".sci-prediction");
        const option = prediction.getByRole("radio", { name: item.label });
        if (testInfo.project.name === "mobile") await option.tap();
        else {
            await option.focus();
            await page.keyboard.press("Space");
        }
        await prediction.getByRole("button", { name: /Reveal/ }).click();
        await expect(prediction).toContainText(item.explanation);
        await prediction.getByRole("button", { name: /Reset/ }).click();
        await expect(option).not.toBeChecked();
    }
});

test("static mathematics and prediction explanations remain without JavaScript", async ({
    browser,
    baseURL,
}, testInfo) => {
    const context = await browser.newContext({ javaScriptEnabled: false, viewport: testInfo.project.use.viewport });
    const page = await context.newPage();
    await page.goto(`${baseURL}${base}/regression`);
    await expect(page.locator("noscript p").filter({ hasText: "Interpolation constrains predictions" })).toContainText(
        "Interpolation constrains predictions"
    );
    await page.goto(`${baseURL}${base}/gaussian-processes`);
    await expect(page.getByRole("img", { name: /One-observation GP posterior/ })).toBeVisible();
    expect(await page.locator(".katex").count()).toBeGreaterThan(3);
    await context.close();
});

test("unknown topics fail closed and production gallery stays private", async ({ page, baseURL }) => {
    expect((await page.goto(`${base}/not-a-topic`))?.status()).toBe(404);
    expect(
        (
            await page.goto(
                `${baseURL?.includes(":3104") ? baseURL : "http://localhost:3001"}/dev/scientific-components`
            )
        )?.status()
    ).toBe(404);
});
