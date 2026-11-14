import { defineConfig } from "@playwright/test";
export default defineConfig({
    testDir: ".",
    testMatch: "animations.spec.ts",
    outputDir: "../../../artifacts/es98e/animation-test-results",
    workers: 1,
    timeout: 120_000,
    use: { baseURL: process.env.ES98E_ANIMATION_BASE_URL || "http://localhost:3000" },
    projects: [
        { name: "desktop", use: { viewport: { width: 1440, height: 1000 } } },
        { name: "mobile", use: { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true } },
    ],
});
