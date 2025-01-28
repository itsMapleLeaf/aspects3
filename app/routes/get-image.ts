const convexUrl = import.meta.env.VITE_CONVEX_SITE

export async function loader({ params }: { params: { id: string } }) {
	const response = await fetch(`${convexUrl}/images/${params.id}`)

	if (!response.ok) {
		return new Response("Image not found", { status: 404 })
	}

	return response
}
