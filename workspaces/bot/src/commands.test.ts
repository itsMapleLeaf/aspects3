import type { Character } from "@workspace/shared/characters"
import { expect, mock, test } from "bun:test"
import * as Discord from "discord.js"
import { addCommands } from "./commands.ts"
import { type CommandContext } from "./context.ts"
import { createInteractionRouter } from "./router.ts"

const dummyCharacterData: Character = {
	name: "Test",
	key: crypto.randomUUID(),
	details: "A brave adventurer",
	traits: ["Brave", "Loyal"],
	attributes: { strength: "5" },
	aspects: { fire: "5" },
	proficientSkills: [],
	imageUrl: "https://example.com/image.png",
	hits: "0",
	fatigue: "0",
	comeback: "0",
}

const emptyCharacter: Character = {
	name: "Test",
	key: crypto.randomUUID(),
	details: "",
	traits: [],
	attributes: {},
	aspects: {},
	proficientSkills: [],
	imageUrl: "https://example.com/image.png",
	hits: "0",
	fatigue: "0",
	comeback: "0",
}

function createMockContext(): CommandContext {
	return {
		findCharacterByUser: async () => ({
			name: "Test Character",
			key: crypto.randomUUID(),
			details: "Test details",
			traits: [],
			attributes: { strength: "10" },
			aspects: { fire: "10" },
			proficientSkills: [],
			imageUrl: "test.jpg",
			hits: "10",
			fatigue: "10",
			comeback: "10",
		}),
		upsertUserWithCharacter: async () => {},
	}
}

test("/characters set - sets the character", async () => {
	const router = createInteractionRouter()
	const context = createMockContext()
	let upsertCalled = false
	context.upsertUserWithCharacter = async () => {
		upsertCalled = true
	}
	addCommands(router, context)

	let replyContent = ""
	// Pre-encoded valid data param (base64)
	const encodedData = Buffer.from(JSON.stringify(dummyCharacterData)).toString(
		"base64",
	)
	const urlWithData = `http://example.com/?data=${encodedData}`

	const fakeInteraction = {
		...createMockInteraction(),
		commandName: "characters",
		options: {
			...createMockInteraction().options,
			getSubcommand: () => "set",
			getString: (name: string, required?: boolean) => {
				if (name === "url") return urlWithData
				return ""
			},
		},
		deferReply: async () => ({}),
		editReply: async (msg: any) => {
			replyContent = msg.content
		},
		toJSON: () => ({}),
	}

	await router.handle(fakeInteraction as unknown as Discord.Interaction)
	expect(replyContent).toContain("You are playing as [**Test**]")
	expect(upsertCalled).toBe(true)
})

test("/characters set - fails when URL missing data param", async () => {
	const router = createInteractionRouter()
	const context = createMockContext()
	addCommands(router, context)

	let replyContent = ""
	const fakeInteraction = {
		...createMockInteraction(),
		commandName: "characters",
		options: {
			...createMockInteraction().options,
			getSubcommand: () => "set",
			getString: (name: string, required?: boolean) => {
				if (name === "url") return "http://example.com/?data="
				return ""
			},
		},
		deferReply: async (_opts?: any) => {},
		editReply: async (msg: any) => {
			replyContent = msg.content
		},
		toJSON: () => ({}),
	}

	await router.handle(fakeInteraction as unknown as Discord.Interaction)
	expect(replyContent).toContain("Invalid URL")
})

test("/characters show - shows the character", async () => {
	const router = createInteractionRouter()
	const context = createMockContext()
	context.findCharacterByUser = async () => dummyCharacterData
	addCommands(router, context)

	let replyContent = ""
	const fakeInteraction = {
		...createMockInteraction(),
		commandName: "characters",
		options: {
			...createMockInteraction().options,
			getSubcommand: () => "show",
		},
		deferReply: async () => ({}),
		editReply: async (msg: any) => {
			replyContent = msg.content
		},
		toJSON: () => ({}),
	}

	await router.handle(fakeInteraction as unknown as Discord.Interaction)
	expect(replyContent).toContain("You are playing as [**Test**]")
})

test("/characters show - tells the user to set a character if one is not set", async () => {
	const router = createInteractionRouter()
	const context: CommandContext = {
		...createMockContext(),
		findCharacterByUser: async () => null,
	}
	addCommands(router, context)

	let replyContent = ""
	const fakeInteraction = {
		...createMockInteraction(),
		commandName: "characters",
		options: {
			...createMockInteraction().options,
			getSubcommand: () => "show",
		},
		deferReply: async () => ({}),
		editReply: async (msg: any) => {
			replyContent = msg.content
		},
		toJSON: () => ({}),
	}

	await router.handle(fakeInteraction as unknown as Discord.Interaction)
	expect(replyContent).toContain("You don't have a character set")
})

test("/roll skill - rolls the skill", async () => {
	const router = createInteractionRouter()
	const context = createMockContext()
	context.findCharacterByUser = async () => dummyCharacterData
	addCommands(router, context)

	let replyContent = ""
	const fakeInteraction = {
		...createMockInteraction(),
		commandName: "roll",
		options: {
			...createMockInteraction().options,
			getSubcommand: () => "skill",
			getString: (name: string, required?: boolean) => {
				if (name === "skill") return "Strike"
				return ""
			},
			getNumber: (name: string, required?: boolean) => {
				if (name === "power") return 0
				if (name === "risk") return 0
				return undefined
			},
		},
		deferReply: async () => ({
			edit: async (msg: any) => {
				replyContent = msg.content
			},
		}),
		toJSON: () => ({}),
	}

	await router.handle(fakeInteraction as unknown as Discord.Interaction)
	expect(replyContent).toContain("Rolling **Strike**")
})

test("/roll skill - fails when no character found", async () => {
	const router = createInteractionRouter()
	const context: CommandContext = {
		...createMockContext(),
		findCharacterByUser: async () => null,
	}
	addCommands(router, context)

	let replyContent = ""
	const fakeInteraction = {
		...createMockInteraction(),
		commandName: "roll",
		options: {
			...createMockInteraction().options,
			getSubcommand: () => "skill",
			getString: (name: string, required?: boolean) => {
				if (name === "skill") return "dash"
				return ""
			},
		},
		deferReply: async () => ({
			edit: async (msg: any) => {
				replyContent = msg.content
			},
		}),
		toJSON: () => ({}),
	}

	await router.handle(fakeInteraction as unknown as Discord.Interaction)
	expect(replyContent).toContain("You don't have a character set")
})

test("/roll aspect - aspect option is set as required", async () => {
	const router = createInteractionRouter()
	const context = createMockContext()
	addCommands(router, context)

	let setFn = mock()

	router.registerCommands({
		application: {
			commands: {
				set: setFn,
			},
		} as any,
	} as unknown as Discord.Client<true>)

	expect(setFn.mock.calls[0]?.[0]).toEqual(
		expect.arrayContaining([
			expect.objectContaining({
				name: "roll",
				options: expect.arrayContaining([
					expect.objectContaining({
						name: "aspect",
						options: expect.arrayContaining([
							expect.objectContaining({ name: "aspect", required: true }),
						]),
					}),
				]),
			}),
		]),
	)
})

test("/roll aspect - rolls the aspect", async () => {
	const router = createInteractionRouter()
	const context = createMockContext()
	context.findCharacterByUser = async () => dummyCharacterData
	addCommands(router, context)

	let replyContent = ""
	const fakeInteraction = {
		...createMockInteraction(),
		commandName: "roll",
		options: {
			...createMockInteraction().options,
			getSubcommand: () => "aspect",
			getString: (name: string, required?: boolean) => {
				if (name === "aspect") return "fire"
				return ""
			},
			getNumber: (name: string, required?: boolean) => {
				if (name === "power") return 0
				if (name === "risk") return 0
				return undefined
			},
		},
		deferReply: async () => ({
			edit: async (msg: any) => {
				replyContent = msg.content
			},
		}),
		toJSON: () => ({}),
	}

	await router.handle(fakeInteraction as unknown as Discord.Interaction)
	expect(replyContent).toContain("Rolling **Fire**")
})

test("/roll aspect - fails for invalid aspect", async () => {
	const router = createInteractionRouter()
	const context = createMockContext()
	context.findCharacterByUser = async () => emptyCharacter
	addCommands(router, context)

	let replyContent = ""
	const fakeInteraction = {
		...createMockInteraction(),
		commandName: "roll",
		options: {
			...createMockInteraction().options,
			getSubcommand: () => "aspect",
			getString: (name: string, required?: boolean) => {
				if (name === "aspect") return "invalidAspect"
				return ""
			},
			getNumber: (name: string, required?: boolean) => {
				if (name === "power") return 0
				if (name === "risk") return 0
				return undefined
			},
		},
		deferReply: async () => ({
			edit: async (msg: any) => {
				replyContent = msg.content
			},
		}),
		toJSON: () => ({}),
	}

	await router.handle(fakeInteraction as unknown as Discord.Interaction)
	expect(replyContent).toContain("Sorry, something went wrong")
})

test("/roll dice - rolls dice", async () => {
	const router = createInteractionRouter()
	const context = createMockContext()
	addCommands(router, context)

	let replyContent = ""
	const fakeInteraction = {
		...createMockInteraction(),
		commandName: "roll",
		options: {
			...createMockInteraction().options,
			getSubcommand: () => "dice",
			getString: (name: string, required?: boolean) => {
				if (name === "dice") return "2d6"
				return ""
			},
		},
		reply: async (msg: any) => {
			replyContent = msg
		},
		toJSON: () => ({}),
	}

	await router.handle(fakeInteraction as unknown as Discord.Interaction)
	expect(replyContent).toContain("Rolling **2d6**")
})

function createMockInteraction() {
	return {
		id: "123456789012345678",
		type: Discord.InteractionType.ApplicationCommand,
		data: {
			name: "test",
			options: [],
		},
		guild_id: "123456789012345678",
		channel_id: "123456789012345678",
		user: {
			id: "123456789012345678",
			username: "testuser",
			displayName: "Test User",
			discriminator: "0000",
			avatar: null,
		},
		member: {
			user: {
				id: "123456789012345678",
				username: "testuser",
				discriminator: "0000",
				avatar: null,
			},
			nick: null,
			role_ids: [],
			premium_since: null,
			deaf: false,
			mute: false,
			flags: 0,
			is_pending: false,
			permissions: "0",
			integration_types: [],
		},
		version: 1,
		token: "testtoken",
		app_permissions: "0",
		message_flags: 0,
		webhook_id: null,
		channel_type: Discord.ChannelType.GuildText,
		integration_types: [],
		options: {
			getSubcommandGroup() {
				return undefined
			},
			getSubcommand() {
				return undefined
			},
			getString() {
				return undefined
			},
			getNumber() {
				return undefined
			},
			getInteger() {
				return undefined
			},
			getBoolean() {
				return undefined
			},
			getUser() {
				return undefined
			},
			getRole() {
				return undefined
			},
			getChannel() {
				return undefined
			},
			getMentionable() {
				return undefined
			},
			getMessage() {
				return undefined
			},
			getFocused() {
				return undefined
			},
		} as any,
		isCommand() {
			return true
		},
		isChatInputCommand() {
			return true
		},
		isAutocomplete() {
			return false
		},
		isButton() {
			return false
		},
		isSelectMenu() {
			return false
		},
		isContextMenuCommand() {
			return false
		},
		isMessageContextMenuCommand() {
			return false
		},
		isUserContextMenuCommand() {
			return false
		},
		inGuild: () => true,
		inCachedGuild: () => true,
		inRawGuild: () => true,
		command: {
			name: "test",
			type: Discord.ApplicationCommandType.ChatInput,
		},
		client: {
			user: null,
			application: {
				commands: {
					cache: new Map(),
				},
			},
		} as unknown as Discord.Client<true>,
	} as const
}
