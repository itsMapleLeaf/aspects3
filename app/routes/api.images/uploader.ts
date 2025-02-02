import { createUploadthing, type FileRouter } from "uploadthing/remix"

const uploader = createUploadthing()

export const uploadRouter = {
	imageUploader: uploader({
		image: {
			/**
			 * For full list of options and defaults, see the File Route API reference
			 * @see https://docs.uploadthing.com/file-routes#route-config
			 */
			maxFileSize: "4MB",
			maxFileCount: 1,
		},
	}).onUploadComplete(async ({ file }) => {
		return {}
	}),
} satisfies FileRouter

export type UploadRouter = typeof uploadRouter
