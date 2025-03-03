import { Heading, HeadingLevel } from "@ariakit/react"
import { api } from "@workspace/backend/convex/_generated/api"
import { useQuery } from "convex-helpers/react/cache"
import {
	Authenticated,
	AuthLoading,
	Unauthenticated,
	useConvex,
} from "convex/react"
import { NavLink, useNavigate } from "react-router"
import { ContentState } from "~/components/ui/ContentState.tsx"
import { IconLabel } from "~/components/ui/IconLabel.tsx"
import { DiscordSignInButton } from "../../components/DiscordSignInButton.tsx"
import { Button } from "../../components/ui/Button.tsx"
import { Icon } from "../../components/ui/Icon.tsx"

export default function PlayRoute() {
	return (
		<>
			<AuthLoading>
				<ContentState.Loading />
			</AuthLoading>
			<Unauthenticated>
				<ContentState.Empty
					icon={<Icon icon="mingcute:group-2-fill" />}
					heading="Sign in to create a room and play with friends!"
				>
					<DiscordSignInButton />
				</ContentState.Empty>
			</Unauthenticated>
			<Authenticated>
				<Rooms />
			</Authenticated>
		</>
	)
}

function Rooms() {
	return (
		<main className="space-y-3 py-8">
			<HeadingLevel>
				<div className="flex items-end justify-between">
					<Heading className="heading-3xl">Rooms</Heading>
					<CreateRoomButton />
				</div>
				<RoomList />
			</HeadingLevel>
		</main>
	)
}

function CreateRoomButton() {
	const convex = useConvex()
	const navigate = useNavigate()
	return (
		<Button
			icon={<Icon icon="mingcute:classify-add-fill" />}
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

function RoomList() {
	const rooms = useQuery(api.public.rooms.listOwned)
	return rooms === undefined ? (
		<ContentState.Loading />
	) : rooms.length === 0 ? (
		<ContentState.Empty heading="You have no rooms yet. Create one to start playing with friends!" />
	) : (
		<ul className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
			{rooms.map((room) => (
				<li key={room._id}>
					<NavLink
						to={`/play/${room.slug}`}
						className="panel hover:bg-primary-950/50 group block px-4 py-3 transition-colors"
					>
						<HeadingLevel>
							<Heading className="heading-xl mb-1">{room.name}</Heading>
							<p className="text-primary-200 flex flex-row gap-3 text-sm opacity-75 transition-opacity group-hover:opacity-100">
								<IconLabel icon={<Icon icon="mingcute:group-2-fill" />}>
									3 players
								</IconLabel>
								<IconLabel icon={<Icon icon="mingcute:time-fill" />}>
									2 days ago
								</IconLabel>
							</p>
						</HeadingLevel>
					</NavLink>
				</li>
			))}
		</ul>
	)
}
