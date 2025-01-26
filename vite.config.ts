import mdx from "@mdx-js/rollup"
import netlify from "@netlify/vite-plugin-react-router"
import { reactRouter } from "@react-router/dev/vite"
import tailwindcss from "@tailwindcss/vite"
import { defineConfig } from "vite"
import tsconfigPaths from "vite-tsconfig-paths"

export default defineConfig({
	plugins: [
		mdx(),
		reactRouter(),
		tsconfigPaths(),
		tailwindcss(),
		process.env.NETLIFY ? netlify() : [],
	],
})
