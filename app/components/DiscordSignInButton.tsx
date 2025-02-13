import { useAuthActions } from "@convex-dev/auth/react"
import { Button } from "./ui/Button.tsx"
import { Icon } from "./ui/Icon.tsx"

export function DiscordSignInButton() {
	const { signIn } = useAuthActions()
	return (
		<Button
			icon={<Icon icon="mingcute:discord-fill" />}
			onClick={() => signIn("discord")}
		>
			Sign in with Discord
		</Button>
	)
}
