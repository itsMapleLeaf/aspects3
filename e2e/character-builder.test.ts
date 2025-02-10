import { expect, test } from "@playwright/test"

test("persistence", async ({ page }) => {
	const textFields = [
		{
			locator: () => page.getByRole("textbox", { name: "Character Name" }),
			value: "Maple",
		},
		{
			locator: () => page.getByRole("textbox", { name: "Intellect" }),
			value: "6",
		},
		{
			locator: () => page.getByRole("textbox", { name: "Sense" }),
			value: "5",
		},
		{
			locator: () => page.getByRole("textbox", { name: "Agility" }),
			value: "3",
		},
		{
			locator: () => page.getByRole("textbox", { name: "Strength" }),
			value: "1",
		},
		{
			locator: () => page.getByRole("textbox", { name: "Wit" }),
			value: "3",
		},
		{
			locator: () => page.getByRole("textbox", { name: "Light" }),
			value: "2",
		},
		{
			locator: () => page.getByRole("textbox", { name: "Water" }),
			value: "1",
		},
		{
			locator: () => page.getByRole("textbox", { name: "Wind" }),
			value: "2",
		},
		{
			locator: () => page.getByRole("textbox", { name: "Fire" }),
			value: "0",
		},
		{
			locator: () => page.getByRole("textbox", { name: "Darkness" }),
			value: "1",
		},
		{
			locator: () => page.getByRole("textbox", { name: "Details" }),
			value: "An intelligent and resourceful character.",
		},
	]

	const meterFields = [
		{
			name: "Hits",
			value: "1",
		},
		{
			name: "Fatigue",
			value: "3",
		},
		{
			name: "Comeback",
			value: "2",
		},
	]

	await page.goto("http://localhost:5173/character-builder")

	for (const field of textFields) {
		await field.locator().fill(field.value)
	}

	for (const field of meterFields) {
		await page.getByRole("button", { name: field.name }).click()
		await page.getByRole("textbox", { name: field.name }).fill(field.value)
		await page.getByRole("textbox", { name: field.name }).blur()
	}

	await page.reload()

	for (const field of textFields) {
		await expect(field.locator()).toHaveValue(field.value)
	}

	for (const field of meterFields) {
		await expect(page.getByRole("button", { name: field.name })).toContainText(
			field.value,
		)
	}
})
