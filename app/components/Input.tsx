import { Icon } from "@iconify/react"
import { type ComponentPropsWithoutRef } from "react"
import { Tooltip } from "./Tooltip"

type InputProps = {
	label?: string
	error?: string
	hint?: string
} & ComponentPropsWithoutRef<"input">

export function Input({
	label,
	error,
	hint,
	className = "",
	readOnly = false,
	...props
}: InputProps) {
	const baseInputClasses =
		"px-3 py-2 border bg-gray-900 w-full rounded-md focus:outline-none transition focus:ring-2 focus:ring-primary-500"
	const stateClasses = readOnly
		? "border-gray-300 dark:border-gray-600"
		: error
		? "border-red-300 focus:border-red-500 focus:ring-red-500"
		: "border-gray-300 dark:border-gray-600"

	const combinedInputClasses = `${baseInputClasses} ${stateClasses}`

	return (
		<div className={className}>
			{label && (
				<label className="flex items-center gap-1 mb-0.5 text-sm text-gray-700 dark:text-gray-300">
					<p className="font-semibold">{label}</p>
					{hint && (
						<Tooltip content={hint}>
							<Icon
								icon="mingcute:information-line"
								className="w-4 h-4 text-gray-400 hover:text-gray-100 transition"
								aria-hidden
							/>
						</Tooltip>
					)}
				</label>
			)}
			<input className={combinedInputClasses} readOnly={readOnly} {...props} />
			{error && (
				<p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>
			)}
		</div>
	)
}
