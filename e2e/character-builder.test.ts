import { openrouter } from "@openrouter/ai-sdk-provider"
import { expect, test } from "@playwright/test"
import { generateText } from "ai"

test("persistence but ai", async ({ page }) => {
	await page.goto("http://localhost:5173/character-builder", {
		waitUntil: "networkidle",
	})

	const html = await page.content()

	const { text } = await generateText({
		model: openrouter("google/gemini-2.0-flash-lite-preview-02-05:free"),
		system: `
			You will receive an instruction and the HTML content of a webpage. Return a list of precise steps for carrying out that instruction. Refer to elements with precise CSS selectors that should only match that element.

			Available actions:
			- click
			- type (text)
			- blur

			## Examples

			Given the instruction "type 'fakeuser' and 'fakepass' into the login form":
			\`\`\`
			- fill (fakeuser) input#username
			- fill (fakepass) input#password
			\`\`\`

			Given the instruction "click the sign in button":
			\`\`\`
			- click button.btn[aria-label="Sign in"]
			\`\`\`
		`,
		prompt: `
			Instruction: Type a random integer from 1 to 6 in each of the attribute text inputs.
			---
			${html}
		`,
	})

	console.info(text)
})

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
