import * as Ariakit from "@ariakit/react"
import { twMerge } from "tailwind-merge"
import { Tooltip } from "./Tooltip.tsx"

export interface SquareIconButtonProps extends Ariakit.ButtonProps {
	icon: React.ReactNode
}

export function SquareIconButton({
	icon,
	children,
	...props
}: SquareIconButtonProps) {
	return (
		<Tooltip content={children}>
			<Ariakit.Button
				type="button"
				{...props}
				className={twMerge(
					"button-ghost aspect-square min-h-10 min-w-10 justify-center p-0",
					props.className,
				)}
			>
				<span className="size-5 *:size-full">{icon}</span>
				<span className="sr-only">{children}</span>
			</Ariakit.Button>
		</Tooltip>
	)
}
