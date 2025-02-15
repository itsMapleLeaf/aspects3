import { Icon as BaseIcon, type IconProps } from "@iconify/react"
import { twMerge } from "tailwind-merge"

export function Icon({ className, ...props }: IconProps) {
	return (
		<div className={twMerge("h-4 w-4 *:size-full", className)}>
			<BaseIcon {...props} className="animate-in fade-in" />
		</div>
	)
}
