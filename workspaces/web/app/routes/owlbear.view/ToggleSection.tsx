import { type ComponentProps, type ReactNode } from "react"
import { twMerge } from "tailwind-merge"
import type { Except } from "type-fest"
import { Icon } from "~/components/ui/Icon.tsx"

export function ToggleSection({
	title,
	className,
	children,
	...props
}: Except<ComponentProps<"details">, "title"> & { title: ReactNode }) {
	return (
		<details className={twMerge("group", className)} {...props}>
			<summary className="heading-2xl hover:text-primary-200 flex cursor-default list-none items-center justify-between gap-1 transition select-none">
				{title}
				<Icon
					icon="mingcute:left-fill"
					className="size-6 transition group-open:-rotate-90"
				/>
			</summary>
			{children}
		</details>
	)
}
