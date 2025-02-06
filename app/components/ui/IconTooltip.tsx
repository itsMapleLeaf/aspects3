import { twMerge } from "tailwind-merge"
import { Icon } from "~/components/ui/Icon.tsx"
import { Tooltip, type TooltipProps } from "~/components/ui/Tooltip.tsx"

export function IconTooltip({ children, className, ...props }: TooltipProps) {
	return (
		<Tooltip
			{...props}
			className={twMerge(
				"size-4 *:size-full hover:*:opacity-100 *:opacity-60 focus-visible:*:opacity-100 *:transition",
				className,
			)}
		>
			{children ?? <Icon icon="mingcute:information-line" aria-hidden />}
		</Tooltip>
	)
}
