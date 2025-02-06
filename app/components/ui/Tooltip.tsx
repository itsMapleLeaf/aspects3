import * as Ariakit from "@ariakit/react"
import { type ReactNode } from "react"

export interface TooltipProps
	extends Omit<Ariakit.TooltipAnchorProps, "content"> {
	content: ReactNode
	placement?: Ariakit.TooltipStoreProps["placement"]
}

export function Tooltip({ placement, content, children }: TooltipProps) {
	const tooltip = Ariakit.useTooltipStore({ placement })

	return (
		<>
			<Ariakit.TooltipAnchor
				store={tooltip}
				className="inline-block rounded-md focus-visible:ring-2 focus-visible:outline-none focus-visible:ring-primary-400"
			>
				{children}
			</Ariakit.TooltipAnchor>
			<Ariakit.Tooltip
				store={tooltip}
				gutter={8}
				portal
				unmountOnHide
				fixed
				className="
					data-[enter]:translate-y-0
					data-[enter]:opacity-100
					data-[leave]:translate-y-1
					data-[leave]:opacity-0
					translate-y-1
					opacity-0
					transition
					duration-200
					rounded
					bg-gray-900
					px-2
					py-1
					text-sm
					text-white
					dark:bg-gray-700
					shadow
					max-w-sm
				"
			>
				{content}
			</Ariakit.Tooltip>
			<p className="sr-only">{content}</p>
		</>
	)
}
