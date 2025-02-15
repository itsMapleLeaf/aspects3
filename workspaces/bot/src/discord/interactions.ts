import * as Discord from "discord.js"

export interface InteractionRoute {
	attach: (client: Discord.Client) => this
	handle: (interaction: Discord.Interaction) => Promise<void>
}

export class InteractionRouter implements InteractionRoute {
	readonly #routes: InteractionRoute[] = []

	use(route: InteractionRoute) {
		this.#routes.push(route)
		return this
	}

	attach(client: Discord.Client) {
		for (const route of this.#routes) {
			route.attach(client)
		}

		client.on("interactionCreate", async (interaction) => {
			await this.handle(interaction)
		})

		return this
	}

	async handle(interaction: Discord.Interaction) {
		await Promise.all(
			this.#routes.map(async (route) => {
				await route.handle(interaction)
			}),
		)
	}
}
