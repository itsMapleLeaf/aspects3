import type { ReactNode } from "react"
import { useToastContext } from "../../components/toasts.tsx"
import { Button } from "../../components/ui/Button.tsx"

export default function DesignSystemRoute() {
	const { showToast } = useToastContext()
	return (
		<main className="space-y-8">
			<Section title="Toasts">
				<Button
					onClick={() => {
						showToast({ type: "success", content: "success!" })
						showToast({ type: "error", content: "oops" })
						showToast({ type: "info", content: "yeah" })
					}}
				>
					Show toasts
				</Button>
			</Section>
		</main>
	)
}

function Section({ title, children }: { title: string; children: ReactNode }) {
	return (
		<section className="space-y-4">
			<h2 className="heading">{title}</h2>
			{children}
		</section>
	)
}
