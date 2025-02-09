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
				Save to Cloud
			</DialogDisclosure>
			<Dialog
				portal
				unmountOnHide
				backdrop={
					<div className="fixed inset-0 bg-black/50 backdrop-blur-sm data-enter:opacity-100 opacity-0 transition duration-200" />
				}
				className="fixed left-1/2 top-1/2 max-w-lg -translate-x-1/2 -translate-y-1/2 [:root:has(&[data-open])]:overflow-hidden group transition opacity-0 data-enter:opacity-100"
				preventBodyScroll={false}
			>
				<div className="panel p-3 flex flex-col items-center gap-4 transition translate-y-2 group-data-enter:translate-y-0">
					<DialogHeading className="text-2xl font-light -mb-2">
						Save to Cloud
					</DialogHeading>
					<DialogDescription>
						Sign in to save your characters to the cloud.
					</DialogDescription>
					<div className="flex gap-2 flex-wrap">
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
