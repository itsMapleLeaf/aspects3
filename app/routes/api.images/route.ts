import { createRouteHandler } from "uploadthing/remix"
import { uploadRouter } from "./uploader.ts"

const handler = createRouteHandler({
	router: uploadRouter,
})

export const loader = handler.loader
export const action = handler.action
