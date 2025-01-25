import { type ComponentPropsWithoutRef } from "react"

type CardProps = {
	title?: string
	subtitle?: string
} & ComponentPropsWithoutRef<"div">

export function Card({
	title,
	subtitle,
	children,
	className = "",
	...props
}: CardProps) {
	return (
		<div
			className={`bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden ${className}`}
			{...props}
		>
			{(title || subtitle) && (
				<div className="px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-gray-700">
					{title && (
						<h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-gray-100">
							{title}
						</h3>
					)}
					{subtitle && (
						<p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
							{subtitle}
						</p>
					)}
				</div>
			)}
			<div className="px-4 py-5 sm:p-6">{children}</div>
		</div>
	)
}
