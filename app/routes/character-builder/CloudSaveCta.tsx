import {
	Dialog,
	DialogDescription,
	DialogDisclosure,
	DialogDismiss,
	DialogHeading,
	DialogProvider,
} from "@ariakit/react"
import { useAuthActions } from "@convex-dev/auth/react"
import { useTransition } from "react"
import { useLocation } from "react-router"
import { Button } from "../../components/ui/Button.tsx"
import { Icon } from "../../components/ui/Icon.tsx"

export function CloudSaveCta() {
	const { signIn } = useAuthActions()
	const [pending, startTransition] = useTransition()
	const location = useLocation()
	return (
		<DialogProvider>
			<DialogDisclosure
				render={
					<Button
						icon={<Icon icon="mingcute:upload-3-fill" />}
						appearance="ghost"
					/>
				}
			>
				Cloud Save
			</DialogDisclosure>
			<Dialog
				portal
				unmountOnHide
				backdrop={
					<div className="fixed inset-0 bg-black/50 opacity-0 backdrop-blur-sm transition duration-200 data-enter:opacity-100" />
				}
				className="group absolute top-1/2 left-1/2 z-10 max-w-lg -translate-x-1/2 -translate-y-1/2 opacity-0 transition data-enter:opacity-100 [:root:has(&[data-open])]:overflow-hidden"
				preventBodyScroll={false}
			>
				<div className="panel flex translate-y-2 flex-col items-center gap-4 p-3 transition group-data-enter:translate-y-0">
					<DialogHeading className="-mb-2 text-2xl font-light">
						Save to Cloud
					</DialogHeading>
					<DialogDescription className="space-y-2 px-4 text-center text-pretty">
						<p>Sign in to save your characters to the cloud.</p>
						<p>
							Export your current character first, then import it after signing
							in.
						</p>
					</DialogDescription>
					<div className="flex flex-wrap gap-2">
						<Button
							icon={<Icon icon="mingcute:discord-fill" />}
							pending={pending}
							onClick={() => {
								startTransition(async () => {
									await signIn("discord", {
										redirectTo: location.pathname + location.search,
									})
								})
							}}
						>
							Sign in with Discord
						</Button>
						<DialogDismiss
							render={
								<Button
									icon={<Icon icon="mingcute:close-fill" />}
									appearance="ghost"
								/>
							}
						>
							Never mind
						</DialogDismiss>
					</div>
				</div>
			</Dialog>
		</DialogProvider>
	)
}
