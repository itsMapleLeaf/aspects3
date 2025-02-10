import { defineConfig, devices } from "@playwright/test"
import "dotenv/config"

export default defineConfig({
	testDir: "e2e",
	fullyParallel: true,
	reporter: "html",
	projects: [
		{
			name: "chromium",
			use: devices["Desktop Chrome"],
		},
		{
			name: "firefox",
			use: devices["Desktop Firefox"],
		},
	],
	use: {
		trace: "on-first-retry",
		headless: process.env.CI === "true",
	},
	webServer: {
		command: "bun run build && bun run start:app",
		port: 5173,
		reuseExistingServer: !process.env.CI,
	},
})
