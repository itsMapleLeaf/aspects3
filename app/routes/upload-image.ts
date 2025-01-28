const uploadUrl = new URL("/images/upload", import.meta.env.VITE_CONVEX_SITE)

export async function action({ request }: { request: Request }) {
	const formData = await request.formData()
	const file = formData.get("file")

	if (!file || !(file instanceof File)) {
		return new Response("No file provided", { status: 400 })
	}

	const response = await fetch(uploadUrl, {
		method: "POST",
		body: formData,
	})

	if (!response.ok) {
		return new Response("Upload failed", { status: response.status })
	}

	return response
}
