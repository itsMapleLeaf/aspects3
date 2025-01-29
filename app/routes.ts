import { type RouteConfig, index, route } from "@react-router/dev/routes"

export default [
	index("routes/rulebook/route.tsx"),
	route("character-builder", "routes/character-builder/route.tsx"),
] satisfies RouteConfig
