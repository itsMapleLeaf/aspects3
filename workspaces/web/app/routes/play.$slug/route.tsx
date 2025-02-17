import {
	Authenticated,
	AuthLoading,
	Unauthenticated,
	useQuery,
} from "convex/react"
import { api } from "../../../convex/_generated/api"
import { DiscordSignInButton } from "../../components/DiscordSignInButton.tsx"
import { Icon } from "../../components/ui/Icon.tsx"
import type { Route } from "./+types/route.ts"

export default function PlaySlugRoute({ params }: Route.ComponentProps) {
	return (
		<>
			<AuthLoading>
				<Icon icon="mingcute:loading-3-fill" className="size-16 animate-spin" />
			</AuthLoading>
			<Unauthenticated>
				<p>Please sign in to continue.</p>
				<DiscordSignInButton />
			</Unauthenticated>
			<Authenticated>
				<RoomDetails slug={params.slug} />
			</Authenticated>
		</>
	)
}

function RoomDetails({ slug }: { slug: string }) {
	const room = useQuery(api.public.rooms.get, { slug })
	return <h1>Welcome to {room?.name}</h1>
}
