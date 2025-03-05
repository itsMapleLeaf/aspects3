import { intersection } from "es-toolkit"
import { ActionsList } from "./ActionsList.tsx"
import { CharacterResourceFields } from "./CharacterResourceFields.tsx"
import { InputField } from "./InputField.tsx"
import { OptionCard } from "./OptionCard.tsx"
import { StatField } from "./StatField.tsx"
import { ToggleSection } from "./ToggleSection.tsx"
import { Character, getComputedCharacter } from "./character.ts"
import { drives, experiences, lineages, roles } from "./data.ts"

export function CharacterEditor({
	character,
	onUpdate,
}: {
	character: Character
	onUpdate: (patch: Partial<Character>) => void
}) {
	const stats = getComputedCharacter(character)

	return (
		<main className="grid gap-6 p-3">
			<div className="grid grid-cols-1 gap-3">
				<div className="flex gap-3">
					<InputField
						label="Name"
						className="flex-1"
						value={character.name}
						onSubmitValue={(value) => {
							onUpdate({ name: value })
						}}
					/>
					<InputField
						label="Level"
						type="number"
						className="w-16"
						min={1}
						max={13}
						value={character.level}
						onSubmitValue={(event) =>
							onUpdate({
								level: Number(event) || 0,
							})
						}
					/>
				</div>

				<CharacterResourceFields character={character} onUpdate={onUpdate} />

				<div className="grid grid-cols-2 gap-4">
					<div className="grid content-start gap-3">
						<StatField
							label="Strength"
							className="min-w-0 flex-1"
							value={character.strengthBonus || 0}
							addition={stats.strength}
							onSubmitValue={(value) => onUpdate({ strengthBonus: value })}
						/>
						<StatField
							label="Sense"
							className="min-w-0 flex-1"
							value={character.senseBonus || 0}
							addition={stats.sense}
							onSubmitValue={(value) => onUpdate({ senseBonus: value })}
						/>
						<StatField
							label="Dexterity"
							className="min-w-0 flex-1"
							value={character.dexterityBonus || 0}
							addition={stats.dexterity}
							onSubmitValue={(value) => onUpdate({ dexterityBonus: value })}
						/>
						<StatField
							label="Presence"
							className="min-w-0 flex-1"
							value={character.presenceBonus || 0}
							addition={stats.presence}
							onSubmitValue={(value) => onUpdate({ presenceBonus: value })}
						/>
					</div>

					<div className="grid content-start gap-3">
						<StatField
							label="Fire"
							className="min-w-0 flex-1"
							value={character.fireBonus || 0}
							addition={stats.fire}
							onSubmitValue={(value) => onUpdate({ fireBonus: value })}
						/>
						<StatField
							label="Water"
							className="min-w-0 flex-1"
							value={character.waterBonus || 0}
							addition={stats.water}
							onSubmitValue={(value) => onUpdate({ waterBonus: value })}
						/>
						<StatField
							label="Wind"
							className="min-w-0 flex-1"
							value={character.windBonus || 0}
							addition={stats.wind}
							onSubmitValue={(value) => onUpdate({ windBonus: value })}
						/>
						<StatField
							label="Light"
							className="min-w-0 flex-1"
							value={character.lightBonus || 0}
							addition={stats.light}
							onSubmitValue={(value) => onUpdate({ lightBonus: value })}
						/>
						<StatField
							label="Darkness"
							className="min-w-0 flex-1"
							value={character.darknessBonus || 0}
							addition={stats.darkness}
							onSubmitValue={(value) => onUpdate({ darknessBonus: value })}
						/>
					</div>
				</div>
			</div>

			<ToggleSection title="Actions">
				<ActionsList character={character} />
			</ToggleSection>

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
				title={`Experiences (${getCharacterExperienceCount(character)}/3)`}
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

function getCharacterExperienceCount(character: Character) {
	return intersection(Object.keys(experiences), character.experiences ?? [])
		.length
}
