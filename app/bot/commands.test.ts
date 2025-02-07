import { expect, test } from "bun:test"
import * as Discord from "discord.js"
import { createInteractionRouter } from "../lib/interactions/router.ts"
import { prisma } from "../lib/prisma.ts"
import { addCommands } from "./commands.ts"

test("/characters set - sets the character", async () => {
	const router = createInteractionRouter()
	addCommands(router)

	let replyContent = ""
	// Dummy character data
	const dummyCharacterData = {
		name: "Test",
		details: "A brave adventurer",
		traits: ["Brave", "Loyal"],
		attributes: { strength: "5" },
		aspects: { fire: "5" },
		proficientSkills: [],
		imageUrl: "https://example.com/image.png",
	}
	// Pre-encoded valid data param (base64)
	const encodedData = Buffer.from(JSON.stringify(dummyCharacterData)).toString(
		"base64",
	)
	const urlWithData = `http://example.com/?data=${encodedData}`

	const fakeInteraction = createMockInteraction({
		commandName: "characters",
		options: {
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
	})

	const originalUpsert = prisma.user.upsert
	// @ts-expect-error
	prisma.user.upsert = async () => ({})

	await router.handle(fakeInteraction)
	expect(replyContent).toContain("You are playing as [**Test**]")
	prisma.user.upsert = originalUpsert
})

test("/characters set - fails when URL missing data param", async () => {
	const router = createInteractionRouter()
	addCommands(router)

	let replyContent = ""
	const fakeInteraction = createMockInteraction({
		commandName: "characters",
		options: {
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
	})

	const originalUpsert = prisma.user.upsert
	// @ts-expect-error
	prisma.user.upsert = async () => ({})

	await router.handle(fakeInteraction)
	expect(replyContent).toContain("Invalid URL")

	prisma.user.upsert = originalUpsert
})

test("/characters show - shows the character", async () => {
	const router = createInteractionRouter()
	addCommands(router)

	let replyContent = ""
	const dummyCharacter = {
		data: {
			name: "Test",
			details: "A brave adventurer",
			traits: ["Brave", "Loyal"],
			attributes: { strength: "5" },
			aspects: { fire: "5" },
			proficientSkills: [],
			imageUrl: "https://example.com/image.png",
		},
	}
	const fakeInteraction = createMockInteraction({
		commandName: "characters",
		options: {
			getSubcommand: () => "show",
		},
		deferReply: async () => ({}),
		editReply: async (msg: any) => {
			replyContent = msg.content
		},
		toJSON: () => ({}),
	})

	const originalFindFirst = prisma.character.findFirst
	// @ts-expect-error
	prisma.character.findFirst = async () => dummyCharacter

	await router.handle(fakeInteraction)
	expect(replyContent).toContain("You are playing as [**Test**]")
	prisma.character.findFirst = originalFindFirst
})

test("/characters show - tells the user to set a character if one is not set", async () => {
	const router = createInteractionRouter()
	addCommands(router)

	let replyContent = ""
	const fakeInteraction = createMockInteraction({
		commandName: "characters",
		options: {
			getSubcommand: () => "show",
		},
		deferReply: async () => ({}),
		editReply: async (msg: any) => {
			replyContent = msg.content
		},
		toJSON: () => ({}),
	})

	const originalFindFirst = prisma.character.findFirst
	// @ts-expect-error
	prisma.character.findFirst = async () => null

	await router.handle(fakeInteraction)
	expect(replyContent).toContain("You don't have a character set")

	prisma.character.findFirst = originalFindFirst
})

test("/roll skill - rolls the skill", async () => {
	const router = createInteractionRouter()
	addCommands(router)

	let replyContent = ""
	// Using "Strike" as a valid skill assumed to belong to "strength"
	const dummyCharacter = {
		data: {
			name: "Test",
			details: "A brave adventurer",
			traits: ["Brave"],
			attributes: { strength: "5" },
			aspects: { fire: "5" },
			proficientSkills: [],
			imageUrl: "https://example.com/image.png",
		},
	}
	const fakeInteraction = createMockInteraction({
		commandName: "roll",
		options: {
			getSubcommand: () => "skill",
			getString: (name: string, required?: boolean) => {
				if (name === "skill") return "Strike"
				return ""
			},
		},
		deferReply: async () => ({
			edit: async (msg: any) => {
				replyContent = msg.content
			},
		}),
		toJSON: () => ({}),
	})

	const originalFindFirst = prisma.character.findFirst
	// @ts-expect-error
	prisma.character.findFirst = async () => dummyCharacter

	await router.handle(fakeInteraction)
	expect(replyContent).toContain("Rolling **Strike**")
	prisma.character.findFirst = originalFindFirst
})

test("/roll skill - fails when no character found", async () => {
	const router = createInteractionRouter()
	addCommands(router)

	let replyContent = ""
	const fakeInteraction = createMockInteraction({
		commandName: "roll",
		options: {
			getSubcommand: () => "skill",
			getString: (name: string, required?: boolean) => {
				if (name === "skill") return "someSkill"
				return ""
			},
		},
		deferReply: async () => ({
			edit: async (msg: any) => {
				replyContent = msg.content
			},
		}),
		toJSON: () => ({}),
	})

	const originalFindFirst = prisma.character.findFirst
	// @ts-expect-error
	prisma.character.findFirst = async () => null

	await router.handle(fakeInteraction)
	expect(replyContent).toContain("You don't have a character set")

	prisma.character.findFirst = originalFindFirst
})

test("/roll aspect - rolls the aspect", async () => {
	const router = createInteractionRouter()
	addCommands(router)

	let replyContent = ""
	// Using "fire" as a valid aspect
	const dummyCharacter = {
		data: {
			name: "Test",
			details: "A brave adventurer",
			traits: ["Brave"],
			attributes: { strength: "5", agility: "3" },
			aspects: { fire: "5" },
			proficientSkills: [],
			imageUrl: "https://example.com/image.png",
		},
	}
	const fakeInteraction = createMockInteraction({
		commandName: "roll",
		options: {
			getSubcommand: () => "aspect",
			getString: (name: string, required?: boolean) => {
				if (name === "aspect") return "fire"
				return ""
			},
		},
		deferReply: async () => ({
			edit: async (msg: any) => {
				replyContent = msg.content
			},
		}),
		toJSON: () => ({}),
	})

	const originalFindFirst = prisma.character.findFirst
	// @ts-expect-error
	prisma.character.findFirst = async () => dummyCharacter

	await router.handle(fakeInteraction)
	expect(replyContent).toContain("Rolling **Fire**")
	prisma.character.findFirst = originalFindFirst
})

test("/roll aspect - fails for invalid aspect", async () => {
	const router = createInteractionRouter()
	addCommands(router)

	let replyContent = ""
	const fakeInteraction = createMockInteraction({
		commandName: "roll",
		options: {
			getSubcommand: () => "aspect",
			getString: (name: string, required?: boolean) => {
				if (name === "aspect") return "invalidAspect"
				return ""
			},
		},
		deferReply: async () => ({
			edit: async (msg: any) => {
				replyContent = msg.content
			},
		}),
		toJSON: () => ({}),
	})

	const dummyCharacter = {
		data: {
			name: "Test",
			details: "",
			traits: [],
			attributes: {},
			aspects: {},
			proficientSkills: [],
		},
	}
	const originalFindFirst = prisma.character.findFirst
	// @ts-expect-error
	prisma.character.findFirst = async () => dummyCharacter

	await router.handle(fakeInteraction)
	expect(replyContent).toContain("Sorry, something went wrong")

	prisma.character.findFirst = originalFindFirst
})

test("/roll dice - rolls dice", async () => {
	const router = createInteractionRouter()
	addCommands(router)

	let replyContent = ""
	const fakeInteraction = createMockInteraction({
		commandName: "roll",
		options: {
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
	})

	await router.handle(fakeInteraction)
	expect(replyContent).toContain("Rolling **2d6**")
})

function createMockInteraction(overrides = {}) {
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
		...overrides,
	} as unknown as Discord.ChatInputCommandInteraction
}
