import { Icon as BaseIcon, type IconProps } from "@iconify/react"
import { twMerge } from "tailwind-merge"

export function Icon({ className, ...props }: IconProps) {
	return (
		<div className={twMerge("*:size-full w-4 h-4", className)}>
			<BaseIcon {...props} className="animate-in fade-in" />
		</div>
	)
}
