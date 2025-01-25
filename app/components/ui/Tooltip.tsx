import { type ReactNode } from "react"

type TooltipProps = {
	content: ReactNode
	children: ReactNode
}

export function Tooltip({ content, children }: TooltipProps) {
	return (
		<>
			<div className="group relative inline-block">
				<div
					tabIndex={0}
					className="focus-visible:ring-2 focus-visible:outline-none focus-visible:ring-indigo-400 rounded-md"
				>
					{children}
				</div>
				<div className="pointer-events-none absolute bottom-full left-1/2 mb-2 -translate-x-1/2 opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100 w-max max-w-sm">
					<div className="relative rounded bg-gray-900 px-2 py-1 text-sm text-white dark:bg-gray-700 shadow translate-y-1 group-focus-within:translate-y-0 group-hover:translate-y-0 transition-transform">
						{content}
					</div>
				</div>
			</div>
			<p className="sr-only">{content}</p>
		</>
	)
}
