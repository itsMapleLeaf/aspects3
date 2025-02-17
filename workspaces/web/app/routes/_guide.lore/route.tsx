import { getPageMeta } from "../../meta.ts"
import Content from "./content.mdx"

export const title = "World Lore"
export const meta = () => getPageMeta(title)

export default function LoreRoute() {
	return (
		<>
			<h1>{title}</h1>
			<Content />
		</>
	)
}
