import { omit } from "es-toolkit"
import { type ComponentProps, type ReactNode } from "react"
import { Link } from "react-router"
import { Icon } from "~/components/ui/Icon.tsx"

const appearanceClasses = {
	primary:
		"bg-primary-500/20 hover:bg-primary-500/30 focus:ring-primary-500/50",
	secondary: "bg-gray-500/20 hover:bg-gray-500/30 focus:ring-gray-500/50",
} as const

const sizeClasses = {
	sm: { button: "px-2 py-1.5 text-sm gap-2", icon: "*:size-3 -mx-0.5" },
	default: { button: "px-3 py-2 text-sm gap-2.5", icon: "*:size-4 -mx-1" },
	lg: { button: "px-5 py-2 text-lg gap-3.5", icon: "*:size-5 -mx-1.5" },
} as const

const shapeClasses = {
	default: "rounded-md",
	circle: "rounded-full aspect-square",
}

type ButtonProps = {
	appearance?: keyof typeof appearanceClasses
	size?: keyof typeof sizeClasses
	shape?: keyof typeof shapeClasses
	icon?: ReactNode
	as?: "button" | "link"
	pending?: boolean
} & (
	| ({ as?: "button" } & ComponentProps<"button">)
	| ({ as: "link" } & ComponentProps<typeof Link>)
)

export function Button({
	appearance = "primary",
	size = "default",
	shape = "default",
	icon,
	className = "",
	children,
	pending,
	...props
}: ButtonProps) {
	const combinedClasses = `
		flex items-center transition border border-primary-500 font-medium shadow-sm focus:outline-none focus:ring-2
		${appearanceClasses[appearance]}
		${sizeClasses[size].button}
		${shapeClasses[shape]}
		${className}
	`

	const content = (
		<>
			<div className={`${sizeClasses[size].icon} empty:hidden`}>
				{pending ? (
					<Icon icon="mingcute:loading-3-fill" className="animate-spin" />
				) : (
					icon
				)}
			</div>
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
