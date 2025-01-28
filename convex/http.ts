import { httpRouter } from "convex/server"
import type { Id } from "./_generated/dataModel"
import { httpAction } from "./_generated/server"

const router = httpRouter()

router.route({
	path: "/images/upload",
	method: "POST",
	handler: httpAction(async function handler(ctx, request) {
		const formData = await request.formData()
		const file = formData.get("file")

		if (!file || !(file instanceof File)) {
			return new Response("No file provided", { status: 400 })
		}

		const buffer = await file.arrayBuffer()
		const blob = new Blob([buffer])
		const storageId = await ctx.storage.store(blob)

		return Response.json({ id: storageId })
	}),
})

router.route({
	path: "/images/:id",
	method: "GET",
	handler: httpAction(async function handler(ctx, request) {
		const url = new URL(request.url)
		const id = url.pathname.split("/").pop()

		if (!id) {
			return new Response("Image ID not provided", { status: 400 })
		}

		try {
			const blob = await ctx.storage.get(id as Id<"_storage">)
			if (!blob) {
				return new Response("Image not found", { status: 404 })
			}

			return new Response(blob, {
				headers: {
					"Content-Type": "image/*",
					"Cache-Control": "public, max-age=31536000",
				},
			})
		} catch (error) {
			return new Response("Invalid image ID", { status: 400 })
		}
	}),
})

export default router
