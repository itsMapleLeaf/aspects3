export const attributes = {
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

export const aspects = {
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

export const lineages = [
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

export const drives = {
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

export const roles = {
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

export const experiences = {
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

export const actions = {
	strike: {
		name: "Strike",
		attribute: attributes.strength,
		description: "punch someone, damage equals number of successes",
	},
	block: {
		name: "Block",
		attribute: attributes.strength,
		description: "reduce damage by number of successes",
	},
	dodge: {
		name: "Dodge",
		attribute: attributes.dexterity,
		description: "roll more successes than damage to avoid it",
	},
	jump: {
		name: "Jump",
		attribute: attributes.dexterity,
		description: "gaps are a suggestion :)",
	},
	dash: {
		name: "Dash",
		attribute: attributes.dexterity,
		description: "s p e e d",
	},
	sneak: {
		name: "Sneak",
		attribute: attributes.dexterity,
		description: "sshhhh",
	},
	shoot: {
		name: "Shoot",
		attribute: attributes.dexterity,
		description: "eat my crossbow bitch",
	},
	locate: {
		name: "Locate",
		attribute: attributes.sense,
		description: "proactively find a thing",
	},
	notice: {
		name: "Notice",
		attribute: attributes.sense,
		description: "reactively see/hear/feel a thing",
	},
	rest: {
		name: "Rest",
		attribute: attributes.sense,
		description: "recover fatigue",
	},
	charm: {
		name: "Charm",
		attribute: attributes.presence,
		description: "bribery",
	},
	intimidate: {
		name: "Intimidate",
		attribute: attributes.presence,
		description: "blackmail",
	},
	deceive: {
		name: "Deceive",
		attribute: attributes.presence,
		description: "try to lie convincingly",
	},
	read: {
		name: "Read",
		attribute: attributes.presence,
		description: "try to see through lies, glean intent, or resist influence",
	},
}
