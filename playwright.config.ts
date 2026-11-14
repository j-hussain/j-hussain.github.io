import { defineConfig } from "@playwright/test";
export default defineConfig({
    testDir: "./tests/browser",
    workers: 2,
    timeout: 120_000,
    use: { baseURL: "http://localhost:3001" },
    webServer: [
        { command: "npm run dev", url: "http://localhost:3000", reuseExistingServer: true },
        { command: "npm run start -- --port 3001", url: "http://localhost:3001", reuseExistingServer: false },
    ],
    projects: [
        { name: "desktop", use: { viewport: { width: 1440, height: 1000 } } },
        { name: "mobile", use: { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true } },
    ],
});
