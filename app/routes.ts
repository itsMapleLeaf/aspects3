import { type RouteConfig, index, route } from "@react-router/dev/routes"

export default [
	index("routes/home.tsx"),
	route("character-sheet", "routes/character-sheet.tsx"),
] satisfies RouteConfig
