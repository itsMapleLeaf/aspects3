import { defineConfig, devices } from "@playwright/test"

export default defineConfig({
	testDir: "e2e",
	fullyParallel: true,
	reporter: [["html", { open: "never" }]],
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
