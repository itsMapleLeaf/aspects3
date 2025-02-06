import { NavLink } from "react-router"

export function Navigation() {
	const links = [
		{ to: "/", label: "Rulebook" },
		{ to: "/lore", label: "World Lore" },
		{ to: "/character-builder", label: "Character Builder" },
	]

	return (
		<nav className="z-10 sticky top-0 bg-gray-950/25 backdrop-blur-md">
			<div className="page-container">
				<div className="-mx-3 items-center flex gap-2 py-3 flex-wrap">
					{links.map((link) => (
						<NavLink
							key={link.to}
							to={link.to}
							className={({ isActive }) =>
								`text-lg px-3 py-1 rounded-full transition whitespace-nowrap hover:bg-primary-800/20 ${
									isActive ? "text-primary-300" : ""
								}`
							}
						>
							{link.label}
						</NavLink>
					))}
				</div>
			</div>
		</nav>
	)
}
