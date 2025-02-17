import { getPageMeta } from "../../../meta.ts"
import Content from "./content.mdx"

export const title = "Rulebook"
export const meta = () => getPageMeta(title)

export default function RulebookRoute() {
	return (
		<>
			<h1>{title}</h1>
			<Content />
		</>
	)
}
