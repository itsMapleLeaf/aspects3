import { NavLink } from "react-router"

export function Navigation() {
	const links = [
		{ to: "/rulebook", label: "Rulebook" },
		{ to: "/lore", label: "World Lore" },
		{ to: "/character-builder", label: "Character Builder" },
	]

	return (
		<nav className="sticky top-0 z-10 bg-gray-950/25 backdrop-blur-md print:hidden">
			<div className="page-container">
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
			</div>
		</nav>
	)
}
