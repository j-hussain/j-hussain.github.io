import { defineConfig } from "@playwright/test";
export default defineConfig({
    testDir: ".",
    testMatch: "module.spec.ts",
    outputDir: "../../../artifacts/es98e/playwright-results",
    workers: 1,
    use: { baseURL: "http://localhost:3104" },
    projects: [
        { name: "desktop", use: { viewport: { width: 1440, height: 1000 } } },
        { name: "mobile", use: { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true } },
    ],
});
