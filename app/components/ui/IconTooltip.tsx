import { twMerge } from "tailwind-merge"
import { Icon } from "~/components/ui/Icon.tsx"
import { Tooltip, type TooltipProps } from "~/components/ui/Tooltip.tsx"

export function IconTooltip({ children, className, ...props }: TooltipProps) {
	return (
		<Tooltip {...props} className="group">
			{children ?? (
				<Icon
					icon="mingcute:information-line"
					className={twMerge(
						"size-4 text-gray-400 group-hover:opacity-100 opacity-75 group-focus-visible:opacity-100",
						className,
					)}
					aria-hidden
				/>
			)}
		</Tooltip>
	)
}
