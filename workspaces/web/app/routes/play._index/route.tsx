import {
	Authenticated,
	AuthLoading,
	Unauthenticated,
	useConvex,
} from "convex/react"
import { useNavigate } from "react-router"
import { api } from "../../../convex/_generated/api"
import { DiscordSignInButton } from "../../components/DiscordSignInButton.tsx"
import { Button } from "../../components/ui/Button.tsx"
import { Icon } from "../../components/ui/Icon.tsx"
import { LoadingSpinner } from "../../components/ui/LoadingSpinner.tsx"

export default function PlayRoute() {
	return (
		<>
			<p>Create a new room to play in real time with friends!</p>
			<AuthLoading>
				<LoadingSpinner />
			</AuthLoading>
			<Unauthenticated>
				<p>Please sign in to continue.</p>
				<DiscordSignInButton />
			</Unauthenticated>
			<Authenticated>
				<CreateRoomButton />
			</Authenticated>
		</>
	)
}

function CreateRoomButton() {
	const convex = useConvex()
	const navigate = useNavigate()
	return (
		<Button
			icon={<Icon icon="mingcute:open-door-fill" />}
			onClick={async () => {
				try {
					const slug = await convex.mutation(api.public.rooms.create)
					navigate(`/play/${slug}`)
				} catch (error) {
					console.error(error)
					alert("Failed to create room.")
				}
			}}
		>
			New room
		</Button>
	)
}
