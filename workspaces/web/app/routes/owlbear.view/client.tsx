import OBR, { Player, Item as SceneItem } from "@owlbear-rodeo/sdk"
import { useEffect, useState } from "react"

/*
materials needed as player:
- At least one character sheet (may play multiple characters or have versions of one, they should be switchable)
- Dice

materials needed as DM:
- Maps (covered by owlbear)
- Several character sheets
- NPC sheets (like character sheets, but token resources (hits/fatigue) are unique)
- Dice

feature set:
- Character browser
	- For GM: List all characters in room
	- For Player: only show their own character(s)
- Character sheet viewer
	- Header
		- "Back to Character List" button
		- Quick dropdown character switcher
	- Name
	- Level
	- Image
	- Settings
		- NPC?
			- if false (default), tokens are synced with the sheet resources
			- if true, tokens track own resources
	- Stats
		- Attribute Scores
		- Aspect scores
		- Aspect skills
	- Resources
		- Hits / Max
		- Fatigue / Max
		- Comeback
	- Lore
		- Lineage
		- Role
		- Experiences
- Dice roller + history

todo:
- [ ] show the name of selected tokens
*/

export function OwlbearExtensionClient() {
	const [player, setPlayer] = useState<Player>()
	useOwlbearReadyEffect(() => {
		return OBR.player.onChange((player) => {
			setPlayer(player)
		})
	})

	const [sceneItems, setSceneItems] = useState<Map<string, SceneItem>>(
		new Map(),
	)
	useOwlbearReadyEffect(() => {
		return OBR.scene.items.onChange((items) => {
			setSceneItems(new Map(items.map((item) => [item.id, item])))
		})
	})

	const selectedSceneItems =
		player?.selection?.flatMap((id) => sceneItems.get(id) ?? []) ?? []

	return (
		<>
			<div className="grid gap-3">
				<pre>
					{selectedSceneItems.map((item) => JSON.stringify(item, null, 2))}
				</pre>
			</div>
		</>
	)
}

function useOwlbearReadyEffect(
	callback: () => (() => void) | undefined | void,
) {
	useEffect(() => {
		if (OBR.isReady) {
			console.debug("sync ready")
			return callback()
		}

		let callbackCleanup: (() => void) | undefined | void

		const cleanup = OBR.onReady(() => {
			console.debug("async ready")
			callbackCleanup = callback()
		}) as unknown as () => void

		return () => {
			cleanup()
			callbackCleanup?.()
		}
	}, [callback])
}
