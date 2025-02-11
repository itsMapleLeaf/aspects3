import type { MetaDescriptor } from "react-router"

export function getPageMeta(title = ""): MetaDescriptor[] {
	return [
		{
			title: getDocumentTitle(title),
		},
		{
			name: "description",
			content: "A rules-lite anime-inspired elemental TTRPG.",
		},
		{
			name: "theme-color",
			content: "#fb64b6",
		},
	]
}

export function getDocumentTitle(prefix: string) {
	return [prefix, "Aspects of Nature"].filter(Boolean).join(" | ")
}
