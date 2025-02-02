import mdx from "@mdx-js/rollup"
import netlify from "@netlify/vite-plugin-react-router"
import { reactRouter } from "@react-router/dev/vite"
import tailwindcss from "@tailwindcss/vite"
import { defineConfig } from "vite"
import babel from "vite-plugin-babel"
import tsconfigPaths from "vite-tsconfig-paths"

export default defineConfig({
	plugins: [
		mdx(),
		reactRouter(),
		tsconfigPaths(),
		tailwindcss(),
		babel({
			filter: /\.[jt]sx?$/,
			include: ["app/**"],
			babelConfig: {
				presets: ["@babel/preset-typescript"], // if you use TypeScript
				plugins: ["babel-plugin-react-compiler"],
			},
		}),
		process.env.NETLIFY ? netlify() : [],
	],
})
