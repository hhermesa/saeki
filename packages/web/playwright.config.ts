import { defineConfig } from '@playwright/test';

export default defineConfig({
    testDir: 'tests',
    timeout: 30_000,
    use: {
        headless: true,
        baseURL: 'http://localhost:3000',
        viewport: { width: 1280, height: 720 },
        ignoreHTTPSErrors: true,
    },
});