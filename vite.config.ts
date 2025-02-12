import mdx from "@mdx-js/rollup"
import netlify from "@netlify/vite-plugin-react-router"
import { reactRouter } from "@react-router/dev/vite"
import tailwindcss from "@tailwindcss/vite"
import autolinkHeadings from "rehype-autolink-headings"
import slug from "rehype-slug"
import remarkGfm from "remark-gfm"
import { defineConfig } from "vite"
import babel from "vite-plugin-babel"
import tsconfigPaths from "vite-tsconfig-paths"

export default defineConfig({
	plugins: [
		mdx({
			remarkPlugins: [remarkGfm],
			rehypePlugins: [slug, [autolinkHeadings, { behavior: "append" }]],
		}),
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
			loader: "jsx",
		}),
		process.env.NETLIFY ? netlify() : [],
	],
})
