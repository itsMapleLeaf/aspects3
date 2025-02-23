import { useAuthActions } from "@convex-dev/auth/react"
import { useLocation } from "react-router"
import { Button } from "./ui/Button.tsx"
import { Icon } from "./ui/Icon.tsx"

export function DiscordSignInButton() {
	const { signIn } = useAuthActions()
	const location = useLocation()
	return (
		<Button
			icon={<Icon icon="mingcute:discord-fill" />}
			onClick={() => signIn("discord", { redirectTo: location.pathname })}
		>
			Sign in with Discord
		</Button>
	)
}
