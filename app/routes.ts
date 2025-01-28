import { type RouteConfig, index, route } from "@react-router/dev/routes"

export default [
	index("routes/rulebook.tsx"),
	route("character-sheet", "routes/character-sheet/route.tsx"),
] satisfies RouteConfig
