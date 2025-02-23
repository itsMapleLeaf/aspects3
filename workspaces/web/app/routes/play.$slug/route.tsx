import { Heading, HeadingLevel } from "@ariakit/react"
import { getResolve, getToughness } from "@workspace/shared/characters"
import { parseNumber } from "@workspace/shared/utils"
import { useQuery } from "convex-helpers/react/cache"
import {
	Authenticated,
	AuthLoading,
	Unauthenticated,
	useConvex,
} from "convex/react"
import { Button } from "~/components/ui/Button.tsx"
import { ContentState } from "~/components/ui/ContentState.tsx"
import { IconLabel } from "~/components/ui/IconLabel.tsx"
import { Menu, MenuButton, MenuItem, MenuPanel } from "~/components/ui/Menu.tsx"
import { Tooltip } from "~/components/ui/Tooltip.tsx"
import { api } from "../../../convex/_generated/api"
import type { Doc, Id } from "../../../convex/_generated/dataModel"
import { DiscordSignInButton } from "../../components/DiscordSignInButton.tsx"
import { Icon } from "../../components/ui/Icon.tsx"
import type { Route } from "./+types/route.ts"

export default function RoomRoute({ params }: Route.ComponentProps) {
	return (
		<>
			<AuthLoading>
				<ContentState.Loading />
			</AuthLoading>
			<Unauthenticated>
				<ContentState
					icon={<Icon icon="mingcute:open-door-line" />}
					heading="Please sign in to continue."
				>
					<DiscordSignInButton />
				</ContentState>
			</Unauthenticated>
			<Authenticated>
				<RoomRouteContent slug={params.slug} />
			</Authenticated>
		</>
	)
}

function RoomRouteContent({ slug }: { slug: string }) {
	const room = useQuery(api.public.rooms.get, { slug })
	return room === undefined ? (
		<ContentState.Loading />
	) : room === null ? (
		<ContentState.Empty />
	) : (
		<HeadingLevel>
			<main className="py-8">
				<Heading className="heading-3xl mb-4">{room?.name}</Heading>
				<div className="flex flex-col gap-4 md:flex-row">
					<section className="flex w-72 flex-col gap-3">
						<RoomCharacterList room={room} />
						<p>
							<AddCharacterButton roomId={room._id} />
						</p>
					</section>
					<section>other stuff here eventually</section>
				</div>
			</main>
		</HeadingLevel>
	)
}

function RoomCharacterList({ room }: { room: Doc<"rooms"> }) {
	const characters = useQuery(api.public.rooms.listCharacters, {
		roomId: room._id,
	})
	return (
		<ul className="flex flex-col gap-3">
			{characters?.map((character) => (
				<li key={character._id}>
					<RoomCharacterCard character={character} room={room} />
				</li>
			))}
		</ul>
	)
}

function RoomCharacterCard({
	character,
	room,
}: {
	character: Doc<"characters">
	room: Doc<"rooms">
}) {
	const me = useQuery(api.public.auth.me)
	return (
		<div className="panel py-2 pr-2 pl-3">
			<HeadingLevel>
				<div className="flex items-start justify-between">
					<Heading className="heading-xl">{character.name}</Heading>
					{(me?._id === character.ownerId || me?._id === room.ownerId) && (
						<RoomCharacterMenuButton character={character} roomId={room._id} />
					)}
				</div>
				<div className="flex items-center gap-3">
					<Tooltip
						content="Hits / Toughness"
						className="hover:text-primary-200 cursor-default transition-colors"
					>
						<IconLabel icon={<Icon icon="mingcute:heart-crack-fill" />}>
							{parseNumber(character.hits)}/{getToughness(character)}
						</IconLabel>
					</Tooltip>
					<Tooltip
						content="Fatigue / Resolve"
						className="hover:text-primary-200 cursor-default transition-colors"
					>
						<IconLabel icon={<Icon icon="mingcute:lightning-fill" />}>
							{parseNumber(character.fatigue)}/{getResolve(character)}
						</IconLabel>
					</Tooltip>
					<Tooltip
						content="Comeback"
						className="hover:text-primary-200 cursor-default transition-colors"
					>
						<IconLabel icon={<Icon icon="mingcute:arrows-up-fill" />}>
							{parseNumber(character.comeback)}
						</IconLabel>
					</Tooltip>
				</div>
			</HeadingLevel>
		</div>
	)
}

function RoomCharacterMenuButton({
	character,
	roomId,
}: {
	character: Doc<"characters">
	roomId: Id<"rooms">
}) {
	const convex = useConvex()
	return (
		<Menu placement="right-start">
			<MenuButton className="button-ghost flex aspect-square min-h-6 min-w-6 items-center justify-center p-0">
				<Icon icon="mingcute:settings-3-fill" className="size-4" />
				<span className="sr-only">Character actions</span>
			</MenuButton>
			<MenuPanel gutter={12}>
				<MenuItem
					onClick={() =>
						convex.mutation(api.public.rooms.unlinkCharacter, {
							roomId,
							characterId: character._id,
						})
					}
				>
					<Icon icon="mingcute:unlink-fill" />
					<span>Unlink from room</span>
				</MenuItem>
			</MenuPanel>
		</Menu>
	)
}

function AddCharacterButton({ roomId }: { roomId: Id<"rooms"> }) {
	const characters = useQuery(api.public.characters.listOwned)
	const convex = useConvex()
	return (
		<Menu>
			<Button
				icon={<Icon icon="mingcute:user-add-2-fill" />}
				render={<MenuButton />}
			>
				Add character
			</Button>
			<MenuPanel>
				{characters?.map((character) => (
					<MenuItem
						onClick={() => {
							convex.mutation(api.public.characters.update, {
								id: character._id,
								data: { roomId },
							})
						}}
					>
						<img
							src={character.imageUrl}
							alt=""
							className="size-6 rounded-full object-cover object-top"
						/>
						<span>{character.name}</span>
					</MenuItem>
				))}
			</MenuPanel>
		</Menu>
	)
}
