import { type ComponentPropsWithoutRef, forwardRef } from "react"

type InputProps = {
	label?: string
	error?: string
	hint?: string
	fullWidth?: boolean
	readOnly?: boolean
} & ComponentPropsWithoutRef<"input">

export const Input = forwardRef<HTMLInputElement, InputProps>(
	(
		{
			label,
			error,
			hint,
			fullWidth = false,
			className = "",
			readOnly = false,
			...props
		},
		ref,
	) => {
		const baseInputClasses =
			"px-3 py-2 border bg-gray-900 rounded-md focus:outline-none transition focus:ring-2 focus:ring-indigo-500"
		const widthClasses = fullWidth ? "w-full" : "w-auto"
		const stateClasses = readOnly
			? "border-gray-300 dark:border-gray-600"
			: error
			? "border-red-300 focus:border-red-500 focus:ring-red-500"
			: "border-gray-300 dark:border-gray-600"

		const combinedInputClasses = `${baseInputClasses} ${widthClasses} ${stateClasses} ${className}`

		return (
			<div className={fullWidth ? "w-full" : "w-auto"}>
				{label && (
					<label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
						{label}
					</label>
				)}
				<input
					ref={ref}
					className={combinedInputClasses}
					readOnly={readOnly}
					{...props}
				/>
				{hint && !error && (
					<p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
						{hint}
					</p>
				)}
				{error && (
					<p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>
				)}
			</div>
		)
	},
)
