import type { Json } from "@uploadthing/shared"
import { createUploadthing } from "uploadthing/remix"
import type { FileRoute } from "uploadthing/types"

const uploader = createUploadthing()

const imageUploader: FileRoute<{
	input: undefined
	output: {}
	errorShape: Json
}> = uploader({
	image: {
		/**
		 * For full list of options and defaults, see the File Route API reference
		 *
		 * @see https://docs.uploadthing.com/file-routes#route-config
		 */
		maxFileSize: "16MB",
		maxFileCount: 1,
	},
}).onUploadComplete(async ({ file }) => {
	return {}
})

export type UploadRouter = typeof uploadRouter
export const uploadRouter = {
	imageUploader,
}
