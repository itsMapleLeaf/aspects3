import { createRouteHandler } from "uploadthing/remix"
import { uploadRouter } from "./uploader.ts"

export const { action, loader } = createRouteHandler({
	router: uploadRouter,
})
