import { NavLink } from "react-router"

export function Navigation() {
	const links = [
		{ to: "/", label: "Rulebook" },
		{ to: "/character-sheet", label: "Characters" },
	]

	return (
		<nav className="max-w-page-body w-full mx-auto">
			<div className="-mx-3 items-center flex gap-2 py-4 flex-wrap">
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
		</nav>
	)
}
