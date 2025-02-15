import {
	generateReactHelpers,
	generateUploadButton,
	generateUploadDropzone,
} from "@uploadthing/react"
import type { UploadRouter } from "./uploader.ts"

export const UploadButton = generateUploadButton<UploadRouter>({
	url: "/api/images",
})
export const UploadDropzone = generateUploadDropzone<UploadRouter>({
	url: "/api/images",
})

export const { useUploadThing } = generateReactHelpers<UploadRouter>({
	url: "/api/images",
})
