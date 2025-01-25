import { omit } from "es-toolkit"
import { type ComponentPropsWithoutRef } from "react"
import { Link } from "react-router"

const variants = {
	primary:
		"bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500",
	secondary:
		"bg-white text-gray-700 hover:bg-gray-50 border-gray-300 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700 dark:border-gray-600",
} as const

type ButtonVariant = keyof typeof variants

type ButtonProps = {
	variant?: ButtonVariant
} & (
	| (ComponentPropsWithoutRef<"button"> & { as?: "button" })
	| (ComponentPropsWithoutRef<typeof Link> & { as: "link" })
)

export function Button({
	variant = "primary",
	className = "",
	...props
}: ButtonProps) {
	const baseClasses =
		"inline-flex items-center px-4 py-2 text-sm transition border border-primary-500 font-medium rounded-md shadow-sm focus:outline-none focus:ring-2"
	const variantClasses = variants[variant]
	const combinedClasses = `${baseClasses} ${variantClasses} ${className}`

	return props.as === "link" ? (
		<Link className={combinedClasses} {...omit(props, ["as"])} />
	) : (
		<button
			className={combinedClasses}
			type="button"
			{...omit(props, ["as"])}
		/>
	)
}
