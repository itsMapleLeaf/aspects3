import { lazy, useSyncExternalStore } from "react"
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
	const isClient = useSyncExternalStore(
		() => () => {},
		() => true,
		() => false,
	)
	return isClient ? <OwlbearExtensionClient /> : <ContentState.Loading />
}
