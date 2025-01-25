import { Link, useLocation } from "react-router"

export function Navigation() {
	const location = useLocation()

	const links = [
		{ to: "/", label: "Home" },
		{ to: "/character-sheet", label: "Character Sheet" },
	]

	return (
		<nav className="bg-white dark:bg-gray-900 shadow">
			<div className="max-w-7xl mx-auto px-4">
				<div className="flex h-16 items-center justify-between">
					<div className="flex space-x-8">
						{links.map((link) => (
							<Link
								key={link.to}
								to={link.to}
								className={`inline-flex items-center px-1 pt-1 text-sm font-medium ${
									location.pathname === link.to
										? "text-primary-600 dark:text-primary-400 border-b-2 border-primary-600 dark:border-primary-400"
										: "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
								}`}
							>
								{link.label}
							</Link>
						))}
					</div>
				</div>
			</div>
		</nav>
	)
}
