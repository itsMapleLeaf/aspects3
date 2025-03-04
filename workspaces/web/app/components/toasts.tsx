import { useAutoAnimate } from "@formkit/auto-animate/react"
import {
	createContext,
	use,
	useState,
	type ComponentProps,
	type ReactNode,
} from "react"
import { twMerge } from "tailwind-merge"

const DEFAULT_TOAST_DURATION = 5000

interface Toast {
	id: string
	type: "success" | "error" | "info"
	content: ReactNode
	timeoutId?: ReturnType<typeof setTimeout>
}

export interface AddToastParams extends Omit<Toast, "id"> {
	duration?: number
}

const ToastContext = createContext({
	showToast: (_params: AddToastParams) => {},
	removeToast: (_id: Toast["id"]) => {},
})

export function useToastContext() {
	return use(ToastContext)
}

export function ToastProvider({
	className,
	children,
}: {
	className: string
	children: React.ReactNode
}) {
	const [toasts, setToasts] = useState<Toast[]>([])
	const [animateRef] = useAutoAnimate()

	const context = {
		showToast: ({
			duration = DEFAULT_TOAST_DURATION,
			...params
		}: AddToastParams) => {
			const toast: Toast = {
				...params,
				id: crypto.randomUUID(),
				timeoutId: setTimeout(() => {
					context.removeToast(toast.id)
				}, duration),
			}
			setToasts((toasts) => [...toasts, toast])
		},

		removeToast: (id: Toast["id"]) => {
			const toast = toasts.find((toast) => toast.id === id)
			if (toast) {
				clearTimeout(toast.timeoutId)
			}
			setToasts((prev) => prev.filter((toast) => toast.id !== id))
		},
	}

	return (
		<ToastContext value={context}>
			{children}
			<div
				className={twMerge(
					"pointer-events-children flex flex-col items-start justify-end gap-3 p-4",
					className,
				)}
				ref={animateRef}
			>
				{toasts.map((toast) => (
					<ToastCard
						key={toast.id}
						type={toast.type}
						tabIndex={0}
						onClick={() => context.removeToast(toast.id)}
					>
						{toast.content}
					</ToastCard>
				))}
			</div>
		</ToastContext>
	)
}

function ToastCard({
	children,
	className,
	type,
	...props
}: ComponentProps<"div"> & {
	type: "info" | "success" | "error"
}) {
	return (
		<div
			className={twMerge(
				"cursor-default rounded-lg border p-4",
				type === "info" &&
					"border-blue-900 bg-blue-900/20 text-blue-100 backdrop-blur-lg transition-colors hover:bg-blue-900/30",
				type === "success" &&
					"border-green-900 bg-green-900/20 text-green-100 backdrop-blur-lg transition-colors hover:bg-green-900/30",
				type === "error" &&
					"border-red-900 bg-red-900/20 text-red-100 backdrop-blur-lg transition-colors hover:bg-red-900/30",
				className,
			)}
			{...props}
		>
			{children}
		</div>
	)
}
