import { expect, test } from "@playwright/test"

test("persistence", async ({ page }) => {
	const textFields = [
		{ name: "Character Name", value: "Maple" },
		{ name: "Intellect", value: "6" },
		{ name: "Sense", value: "5" },
		{ name: "Agility", value: "3" },
		{ name: "Strength", value: "1" },
		{ name: "Wit", value: "3" },
		{ name: "Light", value: "2" },
		{ name: "Water", value: "1" },
		{ name: "Wind", value: "2" },
		{ name: "Fire", value: "0" },
		{ name: "Darkness", value: "1" },
		{ name: "Details", value: "An intelligent and resourceful character." },
	]

	const meterFields = [
		{ name: "Hits", value: "1" },
		{ name: "Fatigue", value: "3" },
		{ name: "Comeback", value: "2" },
	]

	await page.goto("http://localhost:5173/character-builder")

	for (const field of textFields) {
		await page.getByRole("textbox", { name: field.name }).fill(field.value)
	}

	for (const field of meterFields) {
		await page.getByRole("button", { name: field.name }).click()
		await page.getByRole("textbox", { name: field.name }).fill(field.value)
		await page.getByRole("textbox", { name: field.name }).blur()
	}

	await page.reload()

	for (const field of textFields) {
		await expect(page.getByRole("textbox", { name: field.name })).toHaveValue(
			field.value,
		)
	}

	for (const field of meterFields) {
		await expect(page.getByRole("button", { name: field.name })).toContainText(
			field.value,
		)
	}
})
