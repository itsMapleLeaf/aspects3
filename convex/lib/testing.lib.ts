import { convexTest } from "convex-test"
import { glob } from "node:fs/promises"
import { join, resolve } from "node:path"
import schema from "../schema.ts"

const convexRoot = resolve(import.meta.dirname, "..")
const convexModules: Record<string, () => Promise<unknown>> = {}
for await (const modulePath of glob("**/*.ts", { cwd: convexRoot })) {
	convexModules[modulePath.replaceAll("\\", "/")] = () =>
		import(join(convexRoot, modulePath))
}

export function createConvexTest() {
	return convexTest(schema, convexModules)
}
