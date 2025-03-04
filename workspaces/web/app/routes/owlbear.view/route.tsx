import { lazy, useEffect, useState, type ReactNode } from "react"
import { ContentState } from "~/components/ui/ContentState.tsx"

const OwlbearExtensionClient = lazy(async () => {
	const { OwlbearExtensionClient } = await import("./client.tsx")
	return { default: OwlbearExtensionClient }
})

export default function OwlbearExtensionRoute() {
	return (
		<ClientOnly fallback={<ContentState.Loading />}>
			<OwlbearExtensionClient />
		</ClientOnly>
	)
}

function ClientOnly({
	children,
	fallback,
}: {
	children: ReactNode
	fallback: ReactNode
}) {
	const [isClient, setIsClient] = useState(false)
	useEffect(() => setIsClient(true), [])
	return isClient ? children : fallback
}
