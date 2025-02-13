import { chromium } from "@playwright/test"
import { resolve } from "node:path"
import { createServer } from "vite"

const port = 5173
const baseUrl = process.env.URL || "https://aspects.mapleleaf.dev"

console.info("Server port:", port)
console.info("Base URL:", baseUrl)

const isServerOpen = await fetch(`http://localhost:${port}`)
	.then((response) => response.ok)
	.catch(() => false)

let server

if (isServerOpen) {
	console.info("Reusing existing server")
} else {
	console.info("Starting a new server")
	server = await createServer()
	await server.listen()
}

const browser = await chromium.launch({
	logger: {
		isEnabled: () => true,
		log: (name, severity, message) => {
			console.log(`[${name}] ${message}`)
		},
	},
})
const page = await browser.newPage()
await page.goto(`http://localhost:${port}/rulebook`)

// ensure PDF links point to the given site URL
await page.evaluate((baseUrl) => {
	const base = document.createElement("base")
	base.href = baseUrl
	document.head.appendChild(base)
}, baseUrl)

await page.pdf({
	format: "A3",
	path: resolve(import.meta.dirname, "../public/rulebook.pdf"),
})

await browser.close()
await server?.close()
