import OBR from "@owlbear-rodeo/sdk"
import {
	useEffect,
	useId,
	useState,
	type ComponentProps,
	type ReactNode,
} from "react"
import { twMerge } from "tailwind-merge"
import { Icon } from "~/components/ui/Icon.tsx"

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
*/

type Character = {
	id: string
	name: string
	level: number
	hits: number
	fatigue: number
	comeback: number
	lineage?: string | null
	role?: string | null
	drive?: string | null
	experiences?: string[]
	strengthBonus?: number
	senseBonus?: number
	dexterityBonus?: number
	presenceBonus?: number
	fireBonus?: number
	waterBonus?: number
	windBonus?: number
	lightBonus?: number
	darknessBonus?: number
}

function createCharacter(name: string): Character {
	return {
		id: crypto.randomUUID(),
		name,
		level: 1,
		hits: 0,
		fatigue: 0,
		comeback: 0,
		strengthBonus: 0,
		senseBonus: 0,
		dexterityBonus: 0,
		presenceBonus: 0,
		fireBonus: 0,
		waterBonus: 0,
		windBonus: 0,
		lightBonus: 0,
		darknessBonus: 0,
	}
}

const attributes = {
	strength: {
		name: "Strength",
		description: "applying force and heavy hits",
	},
	sense: {
		name: "Sense",
		description: "finding and picking up on things",
	},
	dexterity: {
		name: "Dexterity",
		description: "precision and acrobatics",
	},
	presence: {
		name: "Presence",
		description: "people smarts, influence, manipulation",
	},
}

const aspects = {
	fire: {
		name: "Fire",
		aura: "rage, violence, destruction",
		material: "flame, heat, tectonics",
	},
	water: {
		name: "Water",
		aura: "tranquility, comfort, quiet",
		material: "liquids, vapor, ice",
	},
	wind: {
		name: "Wind",
		aura: "adaptability, turbulence, freedom",
		material: "air, sound, weather",
	},
	light: {
		name: "Light",
		aura: "justice, order, stability",
		material: "physical light, healing, enhancements",
	},
	darkness: {
		name: "Darkness",
		aura: "manipulation, tension, abandon",
		material: "illusions, reality bending, psychology",
	},
}

const lineages = [
	{
		name: "Canine",
		attributes: [attributes.strength, attributes.presence],
		example: "domestic dogs, foxes, wolves, coyotes, jackals",
	},
	{
		name: "Feline",
		attributes: [attributes.sense, attributes.dexterity],
		example: "domestic cats, lions, tigers, panthers",
	},
	{
		name: "Aquatic",
		attributes: [attributes.dexterity, attributes.presence],
		example: "fish, dolphins, other water-bound creatures",
	},
	{
		name: "Reptilian",
		attributes: [attributes.strength, attributes.presence],
		example: "snake, lizard, alligator, crocodile, dragons",
	},
	{
		name: "Avian",
		attributes: [attributes.dexterity, attributes.presence],
		example: "eagles, ravens, penguins, flamingo, all other birds",
	},
	{
		name: "Musteloidea",
		attributes: [attributes.dexterity, attributes.presence],
		example: "panda, skunk, weasel, raccoon",
	},
	{
		name: "Noctillionine",
		attributes: [attributes.sense, attributes.dexterity],
		example: "bats",
	},
	{
		name: "Ursine",
		attributes: [attributes.strength, attributes.sense],
		example: "bears",
	},
	{
		name: "Muridae",
		attributes: [attributes.sense, attributes.dexterity],
		example: "mice, rats, other rodents",
	},
	{
		name: "Arthropoda",
		attributes: [attributes.sense, attributes.dexterity],
		example: "insects, arachnids, bugs, most creatures with exoskeletons",
	},
	{
		name: "Leporine",
		attributes: [attributes.strength, attributes.dexterity],
		example: "rabbits and hares",
	},
	{
		name: "Demonic",
		attributes: [attributes.strength, attributes.presence],
		example: "demons, devils, succubus/incubus, vampires",
	},
]

const drives = {
	dominance: {
		name: "Dominance",
		description:
			"you want to assert control through direct action and force of will",
	},
	empowerment: {
		name: "Empowerment",
		description:
			"you find purpose in enhancing the potential of yourself and others",
	},
	protection: {
		name: "Protection",
		description:
			"you find meaning in preserving the people and things you value",
	},
	adaptation: {
		name: "Adaptation",
		description:
			"you value versatility, responsiveness, and adjusting to changing circumstances",
	},
	manipulation: {
		name: "Manipulation",
		description:
			"you view the world as a complex system to influence as you see fit",
	},
}

const roles = {
	metalworking: {
		name: "Metalworking",
		attribute: attributes.strength,
		examples: "create tools, utensils, weapons, armor, other hardware",
		drives: [drives.dominance, drives.adaptation],
	},
	farming: {
		name: "Farming",
		attribute: attributes.strength,
		examples: "field workers, ranchers",
		drives: [drives.empowerment, drives.protection],
	},
	lawEnforcement: {
		name: "Law Enforcement & Protection",
		attribute: attributes.strength,
		examples: "knight (police), protector",
		drives: [drives.dominance, drives.protection],
	},
	resources: {
		name: "Resources",
		attribute: attributes.strength,
		examples: "mining, material transport",
		drives: [drives.empowerment, drives.protection, drives.adaptation],
	},
	exploration: {
		name: "Exploration & Navigation",
		attribute: attributes.sense,
		examples: "explorer, navigator, cartographer",
		drives: [drives.adaptation, drives.manipulation],
	},
	investigation: {
		name: "Investigation",
		attribute: attributes.sense,
		examples: "detective",
		drives: [drives.dominance, drives.protection, drives.manipulation],
	},
	science: {
		name: "Science",
		attribute: attributes.sense,
		examples:
			"chemistry, astronomy, archaeology, biology, social science, herbalist, meteorologist",
		drives: [drives.empowerment, drives.adaptation],
	},
	medicine: {
		name: "Medicine",
		attribute: attributes.sense,
		examples: "doctor, nurse, surgeon, field medic",
		drives: [drives.empowerment, drives.protection, drives.adaptation],
	},
	transportation: {
		name: "Transportation",
		attribute: attributes.dexterity,
		examples: "wind ferry pilot, horse rider",
		drives: [drives.empowerment, drives.adaptation],
	},
	crafting: {
		name: "Crafting",
		attribute: attributes.dexterity,
		examples: "woodwork, toys, locksmithing, jewelry",
		drives: [drives.dominance, drives.adaptation, drives.manipulation],
	},
	art: {
		name: "Art",
		attribute: attributes.dexterity,
		examples: "painter, musician",
		drives: [drives.dominance, drives.adaptation, drives.manipulation],
	},
	underworld: {
		name: "Underworld",
		attribute: attributes.dexterity,
		examples: "burglars, smugglers, forgers, saboteurs, assassins, spies",
		drives: [drives.dominance, drives.adaptation, drives.manipulation],
	},
	entertainment: {
		name: "Entertainment",
		attribute: attributes.presence,
		examples: "actors, magicians, model, other performers",
		drives: [drives.dominance, drives.adaptation, drives.manipulation],
	},
	socialWork: {
		name: "Social Work",
		attribute: attributes.presence,
		examples: "receptionist, store clerk, surveyor",
		drives: [drives.protection, drives.empowerment],
	},
	education: {
		name: "Education",
		attribute: attributes.presence,
		examples: "academy professor, principals, instructors",
		drives: [drives.protection, drives.empowerment, drives.manipulation],
	},
	law: {
		name: "Law",
		attribute: attributes.presence,
		examples: "legislator, judge, lawyer",
		drives: [drives.protection, drives.empowerment, drives.manipulation],
	},
}

const experiences = {
	stoppedBreakIn: {
		description: "stopped a break-in",
		attribute: attributes.strength,
		aspects: [aspects.fire],
	},
	rebelliousUpbringing: {
		description: "rebellious upbringing",
		attribute: attributes.strength,
		aspects: [aspects.fire, aspects.darkness],
	},
	experiencedDomesticAbuse: {
		description: "experienced domestic abuse",
		attribute: attributes.strength,
		aspects: [aspects.fire, aspects.darkness],
	},
	gotLostInWilderness: {
		description: "got lost in the wilderness",
		attribute: attributes.sense,
		aspects: [aspects.darkness, aspects.wind],
	},
	foragedForSurvival: {
		description: "foraged for survival",
		attribute: attributes.sense,
		aspects: [aspects.wind, aspects.light],
	},
	readLotsOfBooks: {
		description: "read a lot of books",
		attribute: attributes.sense,
		aspects: [aspects.light, aspects.water],
	},
	studiedTopicOfInterest: {
		description: "intensely studied a topic of interest",
		attribute: attributes.sense,
		aspects: [aspects.light, aspects.water],
	},
	trainedInMarksmanship: {
		description: "trained in archery/marksmanship",
		attribute: attributes.dexterity,
		aspects: [aspects.fire, aspects.wind],
	},
	tookGymnastics: {
		description: "took gymnastics",
		attribute: attributes.dexterity,
		aspects: [aspects.wind, aspects.water],
	},
	martialArtsExperience: {
		description: "martial arts experience",
		attribute: attributes.dexterity,
		aspects: [aspects.water, aspects.fire],
	},
	acquaintanceWithCrafter: {
		description: "close acquaintance with a crafter",
		attribute: attributes.dexterity,
		aspects: [aspects.light, aspects.water],
	},
	providedForFamily: {
		description: "worked to provide for your family",
		attribute: attributes.presence,
		aspects: [aspects.light],
	},
	classClown: {
		description: "class clown",
		attribute: attributes.presence,
		aspects: [aspects.wind],
	},
	metFriendlyOutlander: {
		description: "met a friendly outlander",
		attribute: attributes.presence,
		aspects: [aspects.water, aspects.wind],
	},
	livedInStrictHousehold: {
		description: "lived in a strict household",
		attribute: attributes.presence,
		aspects: [aspects.light, aspects.darkness],
	},
	experiencedHomelessness: {
		description: "experienced homelessness",
		attribute: attributes.presence,
		aspects: [aspects.darkness],
	},
	hadSeveralPartners: {
		description: "had several partners",
		attribute: attributes.presence,
		aspects: [aspects.wind, aspects.darkness],
	},
}

export function OwlbearExtensionClient() {
	// const [player, setPlayer] = useState<Player>()
	// useOwlbearReadyEffect(() => {
	// 	return OBR.player.onChange((player) => {
	// 		setPlayer(player)
	// 	})
	// })

	// const [sceneItems, setSceneItems] = useState<Map<string, SceneItem>>(
	// 	new Map(),
	// )
	// useOwlbearReadyEffect(() => {
	// 	return OBR.scene.items.onChange((items) => {
	// 		setSceneItems(new Map(items.map((item) => [item.id, item])))
	// 	})
	// })

	// const selectedSceneItems =
	// 	player?.selection?.flatMap((id) => sceneItems.get(id) ?? []) ?? []

	const [characters, setCharacters] = useState(() => {
		const map = new Map<string, Character>()
		for (const name of ["Luna", "Larissa", "Dusk"]) {
			const character = createCharacter(name)
			map.set(character.id, character)
		}
		return map
	})

	function updateCharacter(id: string, patch: Partial<Character>) {
		setCharacters((characters) => {
			const currentCharacter =
				characters.get(id) ?? createCharacter("Unknown Character")
			return new Map(characters).set(id, {
				...currentCharacter,
				...patch,
			})
		})
	}

	const [view, setView] = useState<
		{ name: "characterList" } | { name: "character"; id: string }
	>({ name: "characterList" })

	const cardButtonStyle = twMerge(
		"flex items-center gap-2 rounded-lg border border-gray-800 bg-gray-900 py-2 px-3 text-start hover:border-gray-700 hover:text-primary-200 transition",
	)

	return (
		<>
			{view.name === "characterList" && (
				<main className="grid gap-3 p-3">
					{[...characters.values()].map((character) => (
						<button
							type="button"
							key={character.id}
							className={cardButtonStyle}
							onClick={() => setView({ name: "character", id: character.id })}
						>
							<Icon icon="mingcute:right-fill" className="size-6" />
							<h2 className="heading-xl">{character.name}</h2>
						</button>
					))}
					<button type="button" className={cardButtonStyle}>
						<Icon icon="mingcute:user-add-2-fill" className="size-6" />
						<h2 className="heading-xl">New Character</h2>
					</button>
				</main>
			)}

			{view.name === "character" && (
				<>
					<header className="sticky top-0 bg-gray-900">
						<button
							type="button"
							className="hover:text-primary-200 flex items-center gap-0.5 px-3 py-2 text-start transition"
							onClick={() => setView({ name: "characterList" })}
						>
							<Icon
								icon="mingcute:left-fill"
								className="pointer-events-none size-5 translate-y-px"
							/>
							<span>Back</span>
						</button>
					</header>
					<CharacterEditor
						character={
							characters.get(view.id) ?? createCharacter("New Character")
						}
						onUpdate={(patch) => updateCharacter(view.id, patch)}
					/>
				</>
			)}
		</>
	)
}

function CharacterEditor({
	character,
	onUpdate,
}: {
	character: Character
	onUpdate: (patch: Partial<Character>) => void
}) {
	const stats = {
		strength: 1,
		sense: 1,
		dexterity: 1,
		presence: 1,

		fire: 0,
		water: 0,
		wind: 0,
		light: 0,
		darkness: 0,
	}

	if (character.lineage) {
		const selectedLineage = lineages.find((l) => l.name === character.lineage)
		if (selectedLineage) {
			for (const attr of selectedLineage.attributes) {
				stats[attr.name.toLowerCase() as keyof typeof stats] += 1
			}
		}
	}

	if (character.role) {
		const selectedRole = roles[character.role as keyof typeof roles]
		if (selectedRole) {
			const attrName = selectedRole.attribute.name.toLowerCase()
			stats[attrName as keyof typeof stats] += 3
		}
	}

	if (character.experiences) {
		for (const expId of character.experiences) {
			const exp = experiences[expId as keyof typeof experiences]
			if (exp) {
				const attrName = exp.attribute.name.toLowerCase()
				stats[attrName as keyof typeof stats] += 2

				if (exp.aspects.length === 1) {
					const aspectName = exp.aspects[0]!.name.toLowerCase()
					stats[aspectName as keyof typeof stats] += 2
				} else if (exp.aspects.length === 2) {
					for (const aspect of exp.aspects) {
						const aspectName = aspect.name.toLowerCase()
						stats[aspectName as keyof typeof stats] += 1
					}
				}
			}
		}
	}

	const maxHits = stats.strength + stats.dexterity + 3
	const maxFatigue = stats.sense + stats.presence

	return (
		<main className="grid gap-6 p-3">
			<div className="grid grid-cols-1 gap-3">
				<div className="flex gap-3">
					<InputField
						label="Name"
						className="flex-1"
						value={character.name}
						onChange={(event) => {
							onUpdate({
								name: event.target.value,
							})
						}}
					/>
					<InputField
						label="Level"
						type="number"
						className="w-16"
						min={1}
						max={13}
						value={character.level}
						onChange={(event) =>
							onUpdate({
								level: event.target.valueAsNumber || 1,
							})
						}
					/>
				</div>

				<div className="flex gap-3">
					<InputField
						label={`Hits / ${maxHits}`}
						type="number"
						className="min-w-0 flex-1"
						min={0}
						value={character.hits}
						onChange={(event) =>
							onUpdate({
								hits: event.target.valueAsNumber || 0,
							})
						}
					/>
					<InputField
						label={`Fatigue / ${maxFatigue}`}
						type="number"
						className="min-w-0 flex-1"
						min={0}
						value={character.fatigue}
						onChange={(event) =>
							onUpdate({
								fatigue: event.target.valueAsNumber || 0,
							})
						}
					/>
					<InputField
						label="Comeback"
						type="number"
						className="min-w-0 flex-1"
						min={0}
						value={character.fatigue}
						onChange={(event) =>
							onUpdate({
								fatigue: event.target.valueAsNumber || 0,
							})
						}
					/>
				</div>

				<div className="grid grid-cols-2 gap-4">
					<div className="grid content-start gap-3">
						<StatField
							label="Strength"
							type="number"
							className="min-w-0 flex-1"
							value={character.strengthBonus || 0}
							addition={stats.strength}
							onValueChange={(value) => onUpdate({ strengthBonus: value })}
						/>
						<StatField
							label="Sense"
							type="number"
							className="min-w-0 flex-1"
							value={character.senseBonus || 0}
							addition={stats.sense}
							onValueChange={(value) => onUpdate({ senseBonus: value })}
						/>
						<StatField
							label="Dexterity"
							type="number"
							className="min-w-0 flex-1"
							value={character.dexterityBonus || 0}
							addition={stats.dexterity}
							onValueChange={(value) => onUpdate({ dexterityBonus: value })}
						/>
						<StatField
							label="Presence"
							type="number"
							className="min-w-0 flex-1"
							value={character.presenceBonus || 0}
							addition={stats.presence}
							onValueChange={(value) => onUpdate({ presenceBonus: value })}
						/>
					</div>

					<div className="grid content-start gap-3">
						<StatField
							label="Fire"
							type="number"
							className="min-w-0 flex-1"
							value={character.fireBonus || 0}
							addition={stats.fire}
							onValueChange={(value) => onUpdate({ fireBonus: value })}
						/>
						<StatField
							label="Water"
							type="number"
							className="min-w-0 flex-1"
							value={character.waterBonus || 0}
							addition={stats.water}
							onValueChange={(value) => onUpdate({ waterBonus: value })}
						/>
						<StatField
							label="Wind"
							type="number"
							className="min-w-0 flex-1"
							value={character.windBonus || 0}
							addition={stats.wind}
							onValueChange={(value) => onUpdate({ windBonus: value })}
						/>
						<StatField
							label="Light"
							type="number"
							className="min-w-0 flex-1"
							value={character.lightBonus || 0}
							addition={stats.light}
							onValueChange={(value) => onUpdate({ lightBonus: value })}
						/>
						<StatField
							label="Darkness"
							type="number"
							className="min-w-0 flex-1"
							value={character.darknessBonus || 0}
							addition={stats.darkness}
							onValueChange={(value) => onUpdate({ darknessBonus: value })}
						/>
					</div>
				</div>
			</div>

			<ToggleSection title="Actions">todo</ToggleSection>

			<ToggleSection title="Lineage">
				<p className="mb-2 text-sm font-medium text-pretty text-gray-300">
					Choose your lineage, which determines your physical appearance and
					traits. Hover over each one for examples.
				</p>
				<div className="grid grid-cols-2 gap-3">
					{lineages.map((lineage) => (
						<OptionCard
							type="radio"
							key={lineage.name}
							label={lineage.name}
							description={lineage.attributes
								.map((it) => `+1 ${it.name}`)
								.join(", ")}
							title={lineage.example}
							checked={character.lineage === lineage.name}
							onChange={() => onUpdate({ lineage: lineage.name })}
						/>
					))}
				</div>
			</ToggleSection>

			<ToggleSection title="Role">
				<p className="mb-2 text-sm font-medium text-pretty text-gray-300">
					Choose your role in this society. Hover over each one for examples.
				</p>
				<div className="grid grid-cols-2 gap-3">
					{Object.entries(roles).map(([roleId, role]) => (
						<OptionCard
							type="radio"
							key={roleId}
							label={role.name}
							description={`+3 ${role.attribute.name}`}
							checked={character.role === roleId}
							onChange={() => onUpdate({ role: roleId })}
							// show name on title in case it gets truncated
							title={`${role.name} - ${role.examples}`}
						/>
					))}
				</div>
			</ToggleSection>

			<ToggleSection title="Drive">
				<p className="mb-2 text-sm font-medium text-pretty text-gray-300">
					Choose your character's drive, the primary motivation that pushes them
					to action. Your chosen drive determines your aspect skills.
				</p>

				{character.role && (
					<>
						<h3 className="text-md mb-1 font-semibold text-gray-200">
							Suggested for the role "
							{character.role &&
								roles[character.role as keyof typeof roles]?.name}
							"
						</h3>
						<div className="mb-4 grid grid-cols-2 gap-3">
							{Object.entries(roles)
								.find(([id]) => id === character.role)?.[1]
								?.drives.map((drive) => (
									<OptionCard
										type="radio"
										key={drive.name}
										label={drive.name}
										description={drive.description}
										checked={character.drive === drive.name}
										onChange={() => onUpdate({ drive: drive.name })}
									/>
								))}
						</div>
					</>
				)}

				<h3 className="text-md mb-1 font-semibold text-gray-200">
					Other drives
				</h3>
				<div className="grid grid-cols-2 gap-3">
					{Object.values(drives)
						.filter(
							(drive) =>
								!character.role ||
								!Object.entries(roles)
									.find(([id]) => id === character.role)?.[1]
									?.drives.includes(drive),
						)
						.map((drive) => (
							<OptionCard
								type="checkbox"
								key={drive.name}
								label={drive.name}
								description={drive.description}
								checked={character.drive === drive.name}
								onChange={() => onUpdate({ drive: drive.name })}
							/>
						))}
				</div>
			</ToggleSection>

			<ToggleSection
				title={`Experiences (${character.experiences?.length || 0}/3)`}
			>
				<p className="mb-2 text-sm font-medium text-pretty text-gray-300">
					Choose three experiences from your character's past. Each experience
					adds +2 to the named attribute and increases your aspect attunement.
				</p>

				<div className="grid gap-3">
					{Object.entries(experiences).map(([id, exp]) => (
						<OptionCard
							type="checkbox"
							key={id}
							label={exp.description}
							description={[
								`${exp.attribute.name} +2`,
								exp.aspects.length === 1
									? exp.aspects.map((it) => it.name).join("") + " +2"
									: exp.aspects.map((it) => it.name + " +1").join(", "),
							]}
							checked={character.experiences?.includes(id) ?? false}
							onChange={() => {
								const currentExperiences = character.experiences || []
								if (currentExperiences.includes(id)) {
									onUpdate({
										experiences: currentExperiences.filter((exp) => exp !== id),
									})
								} else {
									onUpdate({
										experiences: [...currentExperiences, id],
									})
								}
							}}
						/>
					))}
				</div>
			</ToggleSection>
		</main>
	)
}

function OptionCard({
	type,
	label,
	description,
	className,
	checked,
	onChange,
	...props
}: ComponentProps<"label"> & {
	type: "checkbox" | "radio"
	label: ReactNode
	description: string | string[]
	checked: boolean
	onChange: () => void
}) {
	return (
		<label
			className={twMerge(
				"has-checked:bg-primary-dark has-checked:border-primary-900/75 has-checked:hover:border-primary-900 flex flex-col justify-evenly rounded border border-gray-800 bg-gray-900 px-2 py-1.5 transition-colors select-none hover:border-gray-700",
				className,
			)}
			{...props}
		>
			<input
				type={type}
				className="sr-only"
				checked={checked}
				onChange={() => onChange()}
			/>
			<header
				className="group flex items-center gap-1.5"
				data-checked={checked}
			>
				<h3 className="heading-xl min-w-0 flex-1 truncate text-lg">{label}</h3>
				<Icon
					icon="mingcute:check-circle-fill"
					className="text-primary-200/50 shrink-0 opacity-0 transition-opacity group-data-[checked=true]:opacity-100"
				/>
			</header>
			<p className="text-sm text-gray-400">
				{Array.isArray(description)
					? description.map((line, index) => (
							<span key={index} className="block">
								{line}
								{index < description.length - 1 && <br />}
							</span>
						))
					: description}
			</p>
		</label>
	)
}

function ToggleSection({
	title,
	className,
	children,
	...props
}: ComponentProps<"details"> & { title: ReactNode }) {
	return (
		<details className={twMerge("group", className)} {...props}>
			<summary className="heading-2xl hover:text-primary-200 flex cursor-default list-none items-center justify-between gap-1 transition select-none">
				{title}
				<Icon
					icon="mingcute:left-fill"
					className="size-6 transition group-open:-rotate-90"
				/>
			</summary>
			{children}
		</details>
	)
}

function Field({
	label,
	className,
	children,
	htmlFor,
	...props
}: ComponentProps<"div"> & { label: string; htmlFor?: string }) {
	return (
		<div className={twMerge("flex flex-col gap-0.5", className)} {...props}>
			<label htmlFor={htmlFor} className="text-sm/4 font-semibold">
				{label}
			</label>
			{children}
		</div>
	)
}

function InputField({
	label,
	className,
	...props
}: ComponentProps<"input"> & { label: string }) {
	const id = useId()
	return (
		<Field
			label={label}
			className={className}
			htmlFor={props.id ?? id}
			{...props}
		>
			<input
				{...props}
				className="min-w-0 flex-1 rounded border border-gray-800 bg-gray-900 px-2 py-1 transition focus:border-gray-700 focus:outline-none"
			/>
		</Field>
	)
}

function StatField({
	label,
	className,
	addition,
	value,
	onValueChange,
	...props
}: ComponentProps<"input"> & {
	label: string
	value: number
	addition: number
	onValueChange?: (value: number) => void
}) {
	const id = useId()

	return (
		<div
			className={twMerge("flex items-center gap-1.5 tabular-nums", className)}
			{...props}
		>
			<label htmlFor={id} className="w-18 text-end text-sm font-semibold">
				{label}
			</label>
			<strong className="w-4 text-end text-lg">{value + addition}</strong>
			<span className="mx-1 h-5 w-px bg-gray-700"></span>
			<input
				id={id}
				value={value}
				type="number"
				min={0}
				onChange={(event) => {
					const newValue = event.target.valueAsNumber || 0
					onValueChange?.(newValue)
				}}
				{...props}
				className="w-14 min-w-0 rounded border border-gray-800 bg-gray-900 px-2 py-1 transition focus:border-gray-700 focus:outline-none"
			/>
			<p className="shrink-0 cursor-default text-gray-400" title="lore bonuses">
				+{addition}
			</p>
		</div>
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
