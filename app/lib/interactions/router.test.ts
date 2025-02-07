import { expect, mock, test } from "bun:test"
import type { ChatInputApplicationCommandData, Client } from "discord.js"
import { createInteractionRouter } from "./router.ts"

test("registers subcommands as options", async () => {
	const router = createInteractionRouter()

	router.command(() => ({
		name: "test",
		description: "test",
		subcommands: (sub) => {
			sub.command((sub) => ({
				name: "sub",
				description: "sub",
				run: async () => {},
			}))
		},
	}))

	let registered: ChatInputApplicationCommandData[] = []

	await router.registerCommands({
		application: {
			commands: {
				set: mock((args) => {
					registered = args
				}),
			},
		},
	} as unknown as Client<true>)

	expect(registered[0]?.options).toHaveLength(1)
	expect(registered[0]?.options?.[0]?.name).toBe("sub")
})
