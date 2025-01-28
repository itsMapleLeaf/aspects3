import { type RouteConfig, index, route } from "@react-router/dev/routes"

export default [
	index("routes/rulebook.tsx"),
	route("character-sheet", "routes/character-sheet/route.tsx"),
	route("images/upload", "routes/upload-image.ts"),
	route("images/:id", "routes/get-image.ts"),
] satisfies RouteConfig
