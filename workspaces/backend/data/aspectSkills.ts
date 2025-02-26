export type AspectSkill = {
	name: string
	paths: string
	success: string
	failure: string
	aspect: string
}

const aspectSkills = new Map<string, AspectSkill>(
	[
		{
			name: "Flame Strike",
			paths: "Destroyer",
			success: "Deal 3 hits to a target at immediate range",
			failure: "Deal 2 hits to a target at immediate range",
			aspect: "Fire",
		},
		{
			name: "Arc of Flame",
			paths: "Destroyer",
			success: "Deal 1 hit to a target at short range 5 times",
			failure: "Deal 1 hit to a target at short range 3 times",
			aspect: "Fire",
		},
		{
			name: "Cinder Storm",
			paths: "Destroyer",
			success: "Deal 1 hit to a random enemy 5 times",
			failure: "Deal 1 hit to a random character 3 times",
			aspect: "Fire",
		},
		{
			name: "Energize",
			paths: "Guardian",
			success:
				"Prevent a target character from taking fatigue until your next action",
			failure:
				"Prevent a target character from taking up to your base Light score in fatigue until your next action",
			aspect: "Light",
		},
		{
			name: "Healing",
			paths: "Guardian",
			success: "Heal 2 hits from a target",
			failure: "Heal 1 hit from a target",
			aspect: "Light",
		},
		{
			name: "Shield",
			paths: "Guardian",
			success: "A target may not take more than 1 hit until your next action",
			failure: "A target may not take more than 2 hits until your next action",
			aspect: "Water",
		},
		{
			name: "Inspire",
			paths: "Commander",
			success: "Add +2 power dice to a target's next roll",
			failure: "Add +1 power die to a target's next roll",
			aspect: "Light",
		},
		{
			name: "Surge",
			paths: "Commander",
			success: "Repeat the effect of a target's next action 2 times",
			failure: "Repeat the effect of a target's next action",
			aspect: "Wind",
		},
		{
			name: "Multicast",
			paths: "Commander",
			success: "Add two additional targets to a target's action",
			failure: "Add one additional target to a target's action",
			aspect: "Wind",
		},
		{
			name: "Imperil",
			paths: "Manipulator",
			success: "Add +2 risk dice to a target's next roll",
			failure: "Add +1 risk die to a target's next roll",
			aspect: "Darkness",
		},
		{
			name: "Discriminate",
			paths: "Manipulator",
			success:
				"Checks for a chosen aspect have +3 risk dice until your next action",
			failure:
				"Checks for a chosen aspect have +2 risk dice until your next action",
			aspect: "Darkness",
		},
		{
			name: "Frostbite",
			paths: "Manipulator",
			success: "Deal 2 fatigue to a target at immediate range",
			failure: "Deal 1 fatigue to a target at immediate range",
			aspect: "Water",
		},
		{
			name: "Quick Swap",
			paths: "Strategist",
			success: "Swap zones with another chosen character",
			failure: "Swap zones with a random character",
			aspect: "Wind",
		},
		{
			name: "Slide",
			paths: "Strategist",
			success:
				"Choose a zone no further than long range. Until your next turn, moving into that zone does not consume combat movement",
			failure:
				"Choose a zone at short range. Until your next turn, moving into that zone does not consume combat movement",
			aspect: "Water",
		},
		{
			name: "Riftwalk",
			paths: "Strategist",
			success:
				"Mark your current zone and a zone no further than a range equal to your base Darkness score. Until your next action, the marked zones are adjacent",
			failure:
				"Mark your current zone and a zone no further than a range equal to your base Darkness score. Until a character crosses from the first marked zone to the second, the marked zones are adjacent",
			aspect: "Darkness",
		},
		{
			name: "Flamewall",
			paths: "Destroyer, Strategist",
			success:
				"Choose a zone no further than short range. Until your next action, characters entering or exiting that zone take 3 hits",
			failure:
				"Mark your current zone. Until your next action, characters entering or exiting the marked zone take 2 hits",
			aspect: "Fire",
		},
		{
			name: "Tsunami",
			paths: "Destroyer, Strategist",
			success:
				"Choose a target zone no further than long range. Deal hits to characters in that zone equal to their range from you",
			failure:
				"Choose a target zone no further than long range. Deal 1 hit to characters in that zone",
			aspect: "Water",
		},
		{
			name: "Castle",
			paths: "Guardian, Strategist",
			success:
				"All allies at short range may not take more than 1 hit until your next action",
			failure:
				"All allies at short range may not take more than your base Water score in hits until your next action",
			aspect: "Water",
		},
		{
			name: "Restore",
			paths: "Guardian, Strategist",
			success: "Heal 2 hits from all allies in immediate range",
			failure: "Heal 1 hit from all characters in immediate range",
			aspect: "Light",
		},
		{
			name: "Accelerate",
			paths: "Commander, Strategist",
			success: "Allies have +2 combat movements until your next action",
			failure: "Allies have +1 combat movements until your next action",
			aspect: "Wind",
		},
		{
			name: "Heart of Flame",
			paths: "Commander, Strategist",
			success:
				"For each ally in a zone at short range, add +1 power die to their next roll",
			failure:
				"For each ally in a zone at immediate range, add +1 power die to their next roll",
			aspect: "Fire",
		},
		{
			name: "Freeze",
			paths: "Manipulator, Strategist",
			success:
				"Choose a zone no further than medium range. Enemies in that zone cannot move until your next action",
			failure:
				"Mark your current zone. Enemies in the marked zone cannot move until your next action",
			aspect: "Water",
		},
		{
			name: "Expel",
			paths: "Manipulator, Strategist",
			success:
				"Move each enemy at immediate range to any zone within medium range",
			failure: "Move 1 enemy at immediate range to any zone within short range",
			aspect: "Wind",
		},
		{
			name: "Inner Flame",
			paths: "Destroyer, Manipulator",
			success:
				"After taking fatigue for this art, deal your fatigue amount in hits to a character in immediate range",
			failure:
				"After taking fatigue for this art, deal your fatigue amount in hits to a random character in immediate range",
			aspect: "Fire",
		},
		{
			name: "Fair Play",
			paths: "Destroyer, Manipulator",
			success: "Enemies undamaged since your last action take 1 fatigue",
			failure:
				"A random enemy undamaged since your last action takes 1 fatigue",
			aspect: "Wind",
		},
		{
			name: "Pacify",
			paths: "Guardian, Manipulator",
			success: "Target may not deal more than 1 hit until your next action",
			failure:
				"Target may not deal more than your base Light score in hits until your next action",
			aspect: "Light",
		},
		{
			name: "Regret",
			paths: "Guardian, Manipulator",
			success:
				"Deal 1 fatigue to all enemies who've dealt hits since your last action",
			failure:
				"Deal 1 fatigue to one random enemy who's dealt hits since your last action",
			aspect: "Darkness",
		},
		{
			name: "Inversion",
			paths: "Commander, Manipulator",
			success:
				"Until your next action, allies ignore risk dice, and enemies ignore power dice",
			failure:
				"Choose a target. Until your next action, if the target is an ally, they ignore risk dice, and if the target is an enemy, they ignore power dice.",
			aspect: "Darkness",
		},
		{
			name: "Observation",
			paths: "Commander, Manipulator",
			success:
				"Until your next action, ally rolls have +1 power die per risk die on your previous action",
			failure:
				"Until your next action, a target ally’s rolls have +1 power die per risk die on your previous action",
			aspect: "Water",
		},
		{
			name: "Call of the Night",
			paths: "Commander, Destroyer",
			success: "Attacking allies have +1 power die until your next action",
			failure: "A chosen ally has +1 power die on their next attack",
			aspect: "Darkness",
		},
		{
			name: "Inferno",
			paths: "Commander, Destroyer",
			success: "A target's next attack deals triple the hits",
			failure: "A target's next attack deals double the hits",
			aspect: "Fire",
		},
		{
			name: "Focused Healing",
			paths: "Commander, Guardian",
			success: "A target's next action heals triple the hits",
			failure: "A target's next action heals double the hits",
			aspect: "Light",
		},
		{
			name: "Survival Instinct",
			paths: "Commander, Guardian",
			success:
				"A target ally has +1 power die on their next roll for each of their hits",
			failure:
				"A random character has +1 power die on their next roll for each of their hits",
			aspect: "Wind",
		},
		{
			name: "Ray of Equality",
			paths: "Destroyer, Guardian",
			success: "Deal 5 hits to the character with the highest toughness",
			failure: "Deal 3 hits to the character with the highest toughness",
			aspect: "Light",
		},
		{
			name: "Drain",
			paths: "Destroyer, Guardian",
			success: "Deal 1 hit, then heal the amount of hits dealt",
			failure: "Deal 1 hit or heal 1 hit",
			aspect: "Darkness",
		},
	].map((skill) => [skill.name.toLowerCase(), skill]),
)

export function listAspectSkills() {
	return [...aspectSkills.values()]
}

export function getAspectSkill(name: string) {
	return aspectSkills.get(name.toLowerCase())
}
