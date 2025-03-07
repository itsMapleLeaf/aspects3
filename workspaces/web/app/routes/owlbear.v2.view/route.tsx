import { lazy, useSyncExternalStore } from "react"
import { ContentState } from "~/components/ui/ContentState.tsx"

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
