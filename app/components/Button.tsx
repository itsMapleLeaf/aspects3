import { omit } from "es-toolkit"
import { type ComponentProps, type ReactNode } from "react"
import { Link } from "react-router"

const appearanceClasses = {
	primary:
		"bg-primary-500/20 hover:bg-primary-500/30 focus:ring-primary-500/50",
	secondary: "bg-gray-500/20 hover:bg-gray-500/30 focus:ring-gray-500/50",
} as const

const sizeClasses = {
	default: { button: "px-3 py-2 text-sm gap-2.5", icon: "*:size-4 -mx-1" },
	lg: { button: "px-5 py-2 text-lg gap-3.5", icon: "*:size-5 -mx-1.5" },
} as const

type ButtonProps = {
	appearance?: keyof typeof appearanceClasses
	size?: keyof typeof sizeClasses
	icon?: ReactNode
	as?: "button" | "link"
} & (
	| ({ as?: "button" } & ComponentProps<"button">)
	| ({ as: "link" } & ComponentProps<typeof Link>)
)

export function Button({
	appearance = "primary",
	size = "default",
	icon,
	className = "",
	children,
	...props
}: ButtonProps) {
	const combinedClasses = `
		flex items-center transition border border-primary-500 font-medium rounded-md shadow-sm focus:outline-none focus:ring-2
		${appearanceClasses[appearance]}
		${sizeClasses[size].button}
		${className}
	`

	const content = (
		<>
			<div className={sizeClasses[size].icon}>{icon}</div>
			{children}
		</>
	)

	// we don't destructure here because TS can't narrow the union otherwise,
	// and we omit `as` to prevent passing it
	return props.as === "link" ? (
		<Link className={combinedClasses} {...omit(props, ["as"])}>
			{content}
		</Link>
	) : (
		<button className={combinedClasses} type="button" {...omit(props, ["as"])}>
			{content}
		</button>
	)
}
