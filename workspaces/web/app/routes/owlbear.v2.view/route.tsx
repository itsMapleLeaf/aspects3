import { lazy, useEffect, useState, type ReactNode } from "react"
import { ContentState } from "~/components/ui/ContentState.tsx"

// register this early so it can catch the ready iframe message event
if (typeof document !== "undefined") {
	import("@owlbear-rodeo/sdk")
}

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
