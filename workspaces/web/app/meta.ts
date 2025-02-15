import type { MetaDescriptor } from "react-router"

export function getPageMeta(title = ""): MetaDescriptor[] {
	return [
		{
			title: [title, "Aspects of Nature"].filter(Boolean).join(" | "),
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
