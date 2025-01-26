import { Icon } from "@iconify/react"
import { type ComponentPropsWithoutRef, type ReactNode } from "react"
import { Tooltip } from "./Tooltip"

type InputProps = {
	label?: string
	error?: string
	hint?: string
	suffix?: ReactNode
} & ComponentPropsWithoutRef<"input">

export function Input({
	label,
	error,
	hint,
	suffix,
	className = "",
	readOnly = false,
	...props
}: InputProps) {
	const baseInputClasses =
		"flex-1 px-3 py-2 min-w-0 border bg-gray-900 rounded-md focus:outline-none transition focus:ring-2 focus:ring-primary-500"
	const stateClasses = readOnly
		? "border-gray-700"
		: error
		? "border-red-300 focus:border-red-500 focus:ring-red-500"
		: "border-gray-700"

	return (
		<div className={`min-w-0 ${className}`}>
			{label && (
				<label className="flex items-center gap-1 mb-0.5 text-sm text-gray-300">
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
			<div className="flex items-center gap-2">
				<input
					className={`${baseInputClasses} ${stateClasses}`}
					readOnly={readOnly}
					{...props}
				/>
				{suffix}
			</div>
			{error && <p className="mt-1 text-sm text-red-600">{error}</p>}
		</div>
	)
}
