import { Authenticated } from "convex/react"
import { NavLink } from "react-router"
import { twMerge } from "tailwind-merge"
import { UserButton } from "./UserButton.tsx"
import { ExternalLink } from "./ui/ExternalLink.tsx"

export function Navigation({ className = "" }) {
	const navLinkClass = twMerge(
		"hover:bg-primary-800/20 aria-[current=page]:text-primary-300 rounded-full px-3 py-1 text-lg whitespace-nowrap transition",
	)

	return (
		<nav
			className={twMerge(
				"bg-gray-950/25 backdrop-blur-md print:hidden",
				className,
			)}
		>
			<div className="page-container">
				<div className="flex items-center gap-6">
					<div className="-mx-3 flex flex-wrap items-center gap-2 py-3">
						<ExternalLink
							href="https://itsmapleleaf.notion.site/Aspects-of-Nature-How-to-Play-1a0b0b885c0e80969418d493e69be654"
							className={navLinkClass}
						>
							Guidebook
						</ExternalLink>
						<NavLink to="/character-builder" className={navLinkClass}>
							Character Builder
						</NavLink>
						<NavLink to="/play" className={navLinkClass}>
							Play
						</NavLink>
					</div>
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
