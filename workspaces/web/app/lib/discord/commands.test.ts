import { expect, mock, test } from "bun:test"
import * as Discord from "discord.js"
import { CommandRouter } from "./commands.ts"

function createMockClient() {
	return {
		application: {
			commands: {
				set: mock(),
			},
		},
	}
}

function createMockInteraction() {
	return {
		isCommand: mock(() => true),
		isChatInputCommand: mock(() => true),
		commandName: "ping",
		reply: mock(),
		user: { id: "123" },
	}
}

test("basic command", async () => {
	const router = new CommandRouter().use({
		data: {
			name: "ping",
			description: "Ping!",
		},
		async handle(interaction) {
			if (!interaction.isChatInputCommand()) {
				throw new Error("Invalid interaction type")
			}
			await interaction.reply("Pong!")
		},
	})

	const client = createMockClient()

	await router.registerApplicationCommands(
		client as unknown as Discord.Client<true>,
	)

	expect(client.application.commands.set).toHaveBeenCalledTimes(1)
	expect(client.application.commands.set).toHaveBeenCalledWith([
		{ name: "ping", description: "Ping!" },
	])

	const interaction = createMockInteraction()

	await router.handle(interaction as unknown as Discord.Interaction)

	expect(interaction.reply).toHaveBeenCalledTimes(1)
	expect(interaction.reply).toHaveBeenCalledWith("Pong!")
})

test("CommandRouter", () => {
	// let's use it straight to see what our abstractions might look like

	const router = new CommandRouter()

	// basic command
	router.use({
		data: {
			name: "ping",
			description: "Ping!",
		},
		async handle(interaction) {
			if (!interaction.isChatInputCommand()) {
				throw new Error("Invalid interaction type")
			}
			await interaction.reply("Pong!")
		},
	})

	// options
	router.use({
		data: {
			name: "echo",
			description: "Repeats your text",
			options: [
				{
					type: Discord.ApplicationCommandOptionType.String,
					name: "text",
					description: "Text to echo",
					required: true,
				},
			],
		},
		async handle(interaction) {
			if (!interaction.isChatInputCommand()) {
				throw new Error("Invalid interaction type")
			}
			const text = interaction.options.getString("text", true)
			await interaction.reply(text)
		},
	})

	// autocomplete
	router.use({
		data: {
			name: "fruit",
			description:
				"Tell me your favorite fruit. I'll help you out with some suggestions.",
			options: [
				{
					type: Discord.ApplicationCommandOptionType.String,
					name: "fruit",
					description: "Your favorite fruit",
					required: true,
					autocomplete: true,
				},
			],
		},
		async handle(interaction) {
			if (interaction.isAutocomplete()) {
				const focused = interaction.options.getFocused(true)
				const fruits = ["apple", "banana", "orange", "grape", "strawberry"]
				const filtered = fruits.filter((fruit) =>
					fruit.startsWith(focused.value),
				)
				await interaction.respond(
					filtered.map((fruit) => ({ name: fruit, value: fruit })),
				)
			} else if (interaction.isChatInputCommand()) {
				const fruit = interaction.options.getString("fruit", true)
				await interaction.reply(
					`Got it! I'll remember that your favorite fruit is ${fruit}`,
				)
			} else {
				throw new Error("Invalid interaction type")
			}
		},
	})

	// subcommands
	router.use({
		data: {
			name: "math",
			description: "Do some math",
			options: [
				{
					type: Discord.ApplicationCommandOptionType.Subcommand,
					name: "add",
					description: "Add two numbers",
					options: [
						{
							type: Discord.ApplicationCommandOptionType.Number,
							name: "a",
							description: "First number",
							required: true,
						},
						{
							type: Discord.ApplicationCommandOptionType.Number,
							name: "b",
							description: "Second number",
							required: true,
						},
					],
				},
				{
					type: Discord.ApplicationCommandOptionType.Subcommand,
					name: "subtract",
					description: "Subtract two numbers",
					options: [
						{
							type: Discord.ApplicationCommandOptionType.Number,
							name: "a",
							description: "First number",
							required: true,
						},
						{
							type: Discord.ApplicationCommandOptionType.Number,
							name: "b",
							description: "Second number",
							required: true,
						},
					],
				},
			],
		},
		async handle(interaction) {
			if (interaction.commandName !== "math") return
			if (!interaction.isChatInputCommand()) return

			const subcommand = interaction.options.getSubcommand(true)
			if (subcommand === "add") {
				const a = interaction.options.getNumber("a", true)
				const b = interaction.options.getNumber("b", true)
				await interaction.reply(`The sum is ${a + b}`)
			} else if (subcommand === "subtract") {
				const a = interaction.options.getNumber("a", true)
				const b = interaction.options.getNumber("b", true)
				await interaction.reply(`The difference is ${a - b}`)
			} else {
				throw new Error("Unknown subcommand")
			}
		},
	})
})
