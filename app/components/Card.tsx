import { type ComponentProps } from "react"

interface CardProps extends ComponentProps<"div"> {
	title?: string
	subtitle?: string
}

export function Card({
	title,
	subtitle,
	children,
	className = "",
	...props
}: CardProps) {
	return (
		<div className={`shadow overflow-clip rounded-lg ${className}`} {...props}>
			{(title || subtitle) && (
				<div className="">
					{title && (
						<h3 className="text-3xl font-light mb-3 text-gray-100">{title}</h3>
					)}
					{subtitle && <p className="mt-1 text-sm text-gray-400">{subtitle}</p>}
				</div>
			)}
			<div className="">{children}</div>
		</div>
	)
}
