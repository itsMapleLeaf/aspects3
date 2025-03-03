import {
	generateReactHelpers,
	generateUploadButton,
	generateUploadDropzone,
} from "@uploadthing/react"
import type { UploadRouter } from "./uploader.ts"

// the weird manual type imports fix the portal type issue
// https://github.com/microsoft/TypeScript/pull/58176

export const UploadButton: ReturnType<
	typeof generateUploadButton<UploadRouter>
> = generateUploadButton<UploadRouter>({
	url: "/api/images",
})

export const UploadDropzone: ReturnType<
	typeof generateUploadDropzone<UploadRouter>
> = generateUploadDropzone<UploadRouter>({
	url: "/api/images",
})

const reactHelpers = generateReactHelpers<UploadRouter>({
	url: "/api/images",
})

export const useUploadThing: ReturnType<
	typeof generateReactHelpers<UploadRouter>
>["useUploadThing"] = reactHelpers.useUploadThing
