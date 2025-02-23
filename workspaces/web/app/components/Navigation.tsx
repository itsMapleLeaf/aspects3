import { Authenticated } from "convex/react"
import { NavLink } from "react-router"
import { twMerge } from "tailwind-merge"
import { UserButton } from "./UserButton.tsx"

export function Navigation({ className = "" }) {
	return (
		<nav
			className={twMerge(
				"bg-gray-950/25 backdrop-blur-md print:hidden",
				className,
			)}
		>
			<div className="page-container">
				<div className="flex items-center gap-6">
					<NavLinkList />
					<div className="flex flex-1 justify-end">
						<Authenticated>
							<UserButton />
						</Authenticated>
					</div>
				</div>
			</div>
		</nav>
	)
}

function NavLinkList() {
	const links = [
		{ to: "/rulebook", label: "Rulebook" },
		{ to: "/lore", label: "World Lore" },
		{ to: "/character-builder", label: "Character Builder" },
		import.meta.env.DEV && { to: "/play", label: "Play" },
	].filter(Boolean)

	return (
		<div className="-mx-3 flex flex-wrap items-center gap-2 py-3">
			{links.map((link) => (
				<NavLink
					key={link.to}
					to={link.to}
					className={({ isActive }) =>
						`hover:bg-primary-800/20 rounded-full px-3 py-1 text-lg whitespace-nowrap transition ${
							isActive ? "text-primary-300" : ""
						}`
					}
				>
					{link.label}
				</NavLink>
			))}
		</div>
	)
}
