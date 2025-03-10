import { afterEach, beforeEach, expect, mock, test } from "bun:test"
import type { Except } from "type-fest"
import {
	createEmptyCharacterFields,
	type CharacterFields,
} from "../../data/character.ts"
import { api } from "../_generated/api"
import type { Doc, Id } from "../_generated/dataModel"
import { createConvexTest } from "../lib/testing.lib.ts"

function createAuthToken(userId: Id<"users">) {
	return {
		type: "access_token",
		tokenIdentifier: `test|${userId}`,
		issuer: "test",
		subject: userId,
	}
}

function createCharacterFields(name: string): CharacterFields {
	return {
		...createEmptyCharacterFields(),
		name,
	}
}

function createCharacterDoc(
	name: string,
	ownerId: Id<"users">,
): Except<Doc<"characters">, "_id" | "_creationTime"> {
	return {
		ownerId,
		fields: createCharacterFields(name),
	}
}

let realConsoleWarn = console.warn
beforeEach(() => {
	realConsoleWarn = console.warn
	console.warn = mock()
})
afterEach(() => {
	console.warn = realConsoleWarn
})

test("get - returns null if character does not exist", async () => {
	const t = createConvexTest()

	const character = await t.query(api.public.characters.get, {
		id: "does-not-exist" as Id<"characters">,
	})

	expect(character).toBeNull()
})

test("get - returns null if not logged in", async () => {
	const t = createConvexTest()
	const id = await t.run(async (ctx) => {
		const userId = await ctx.db.insert("users", {})
		return await ctx.db.insert(
			"characters",
			createCharacterDoc("Test Character", userId),
		)
	})

	const character = await t.query(api.public.characters.get, {
		id: id.toString(),
	})

	expect(character).toBeNull()
})

test("get - returns null if not character owner", async () => {
	const t = createConvexTest()
	const id = await t.run(async (ctx) => {
		const userId = await ctx.db.insert("users", {})
		return await ctx.db.insert(
			"characters",
			createCharacterDoc("Test Character", userId),
		)
	})

	const otherUserId = await t.run(async (ctx) => {
		return await ctx.db.insert("users", {})
	})
	const otherUser = t.withIdentity(createAuthToken(otherUserId))
	const character = await otherUser.query(api.public.characters.get, {
		id: id.toString(),
	})

	expect(character).toBeNull()
})

test("get - returns character if logged in and character owner", async () => {
	const t = createConvexTest()
	const userId = await t.run(async (ctx) => {
		return await ctx.db.insert("users", {})
	})
	const user = t.withIdentity(createAuthToken(userId))

	const id = await t.run(async (ctx) => {
		return await ctx.db.insert(
			"characters",
			createCharacterDoc("Test Character", userId),
		)
	})

	const character = await user.query(api.public.characters.get, {
		id: id.toString(),
	})

	expect(character).toMatchObject({
		ownerId: userId,
		fields: { name: "Test Character" },
	})
})

test("listOwned - returns empty array if not logged in", async () => {
	const t = createConvexTest()
	await t.run(async (ctx) => {
		const userId = await ctx.db.insert("users", {})
		await ctx.db.insert(
			"characters",
			createCharacterDoc("Test Character", userId),
		)
	})

	const characters = await t.query(api.public.characters.listOwned)
	expect(characters).toEqual([])
})

test("listOwned - returns empty array if not character owner", async () => {
	const t = createConvexTest()
	await t.run(async (ctx) => {
		const userId = await ctx.db.insert("users", {})
		await ctx.db.insert(
			"characters",
			createCharacterDoc("Test Character", userId),
		)
	})

	const otherUserId = await t.run(async (ctx) => {
		return await ctx.db.insert("users", {})
	})
	const otherUser = t.withIdentity(createAuthToken(otherUserId))
	const characters = await otherUser.query(api.public.characters.listOwned)
	expect(characters).toEqual([])
})

test("listOwned - returns array of characters if logged in and character owner", async () => {
	const t = createConvexTest()
	const userId = await t.run(async (ctx) => {
		return await ctx.db.insert("users", {})
	})
	const user = t.withIdentity(createAuthToken(userId))

	await t.run(async (ctx) => {
		await ctx.db.insert("characters", createCharacterDoc("Character 1", userId))
		await ctx.db.insert("characters", createCharacterDoc("Character 2", userId))
	})

	const characters = await user.query(api.public.characters.listOwned)
	expect(characters.map((c) => c.fields!.name)).toEqual([
		"Character 1",
		"Character 2",
	])
})

test("listOwner - only returns characters owned by the user", async () => {
	const t = createConvexTest()
	const userId = await t.run(async (ctx) => {
		return await ctx.db.insert("users", {})
	})
	const user = t.withIdentity(createAuthToken(userId))

	await t.run(async (ctx) => {
		await ctx.db.insert("characters", createCharacterDoc("Character 1", userId))
		await ctx.db.insert(
			"characters",
			createCharacterDoc("Character 2", await ctx.db.insert("users", {})),
		)
	})

	const characters = await user.query(api.public.characters.listOwned)
	expect(characters.map((c) => c.fields!.name)).toEqual(["Character 1"])
})

test("create - throws if not logged in", async () => {
	const t = createConvexTest()

	expect(
		t.mutation(
			api.public.characters.create,
			createCharacterFields("Test Character"),
		),
	).rejects.toThrow()
})

test("create - creates character and returns id if logged in", async () => {
	const t = createConvexTest()
	const userId = await t.run(async (ctx) => {
		return await ctx.db.insert("users", {})
	})
	const user = t.withIdentity(createAuthToken(userId))

	const id = await user.mutation(
		api.public.characters.create,
		createCharacterFields("Test Character"),
	)

	const character = await t.run(async (ctx) => {
		return await ctx.db.get(id)
	})

	expect(character).toMatchObject({
		ownerId: userId,
		fields: { name: "Test Character" },
	})
})

test("update - throws if not logged in", async () => {
	const t = createConvexTest()
	const id = await t.run(async (ctx) => {
		const userId = await ctx.db.insert("users", {})
		return await ctx.db.insert(
			"characters",
			createCharacterDoc("Test Character", userId),
		)
	})

	expect(
		t.mutation(api.public.characters.update, {
			id,
			data: createCharacterFields("Updated Name"),
		}),
	).rejects.toThrow()
})

test("update - throws if not character owner", async () => {
	const t = createConvexTest()
	const id = await t.run(async (ctx) => {
		const userId = await ctx.db.insert("users", {})
		return await ctx.db.insert(
			"characters",
			createCharacterDoc("Test Character", userId),
		)
	})

	const otherUserId = await t.run(async (ctx) => {
		return await ctx.db.insert("users", {})
	})
	const otherUser = t.withIdentity(createAuthToken(otherUserId))
	expect(
		otherUser.mutation(api.public.characters.update, {
			id,
			data: createCharacterFields("Updated Name"),
		}),
	).rejects.toThrow()
})

test("update - updates character if logged in and character owner", async () => {
	const t = createConvexTest()
	const userId = await t.run(async (ctx) => {
		return await ctx.db.insert("users", {})
	})
	const user = t.withIdentity(createAuthToken(userId))

	const id = await t.run(async (ctx) => {
		return await ctx.db.insert(
			"characters",
			createCharacterDoc("Test Character", userId),
		)
	})

	await user.mutation(api.public.characters.update, {
		id,
		data: createCharacterFields("Updated Name"),
	})

	const character = await t.run(async (ctx) => {
		return await ctx.db.get(id)
	})

	expect(character).toMatchObject({
		ownerId: userId,
		fields: { name: "Updated Name" },
	})
})

test("delete - throws if not logged in", async () => {
	const t = createConvexTest()
	const id = await t.run(async (ctx) => {
		const userId = await ctx.db.insert("users", {})
		return await ctx.db.insert(
			"characters",
			createCharacterDoc("Test Character", userId),
		)
	})

	expect(t.mutation(api.public.characters.delete, { id })).rejects.toThrow()
})

test("delete - throws if not character owner", async () => {
	const t = createConvexTest()
	const id = await t.run(async (ctx) => {
		const userId = await ctx.db.insert("users", {})
		return await ctx.db.insert(
			"characters",
			createCharacterDoc("Test Character", userId),
		)
	})

	const otherUserId = await t.run(async (ctx) => {
		return await ctx.db.insert("users", {})
	})
	const otherUser = t.withIdentity(createAuthToken(otherUserId))
	expect(
		otherUser.mutation(api.public.characters.delete, { id }),
	).rejects.toThrow()
})

test("delete - deletes character if logged in and character owner", async () => {
	const t = createConvexTest()
	const userId = await t.run(async (ctx) => {
		return await ctx.db.insert("users", {})
	})
	const user = t.withIdentity(createAuthToken(userId))

	const id = await t.run(async (ctx) => {
		return await ctx.db.insert(
			"characters",
			createCharacterDoc("Test Character", userId),
		)
	})

	await user.mutation(api.public.characters.delete, { id })

	const character = await t.run(async (ctx) => {
		return await ctx.db.get(id)
	})

	expect(character).toBeNull()
})

test("clone - throws if not logged in", async () => {
	const t = createConvexTest()
	const id = await t.run(async (ctx) => {
		const userId = await ctx.db.insert("users", {})
		return await ctx.db.insert(
			"characters",
			createCharacterDoc("Test Character", userId),
		)
	})

	expect(t.mutation(api.public.characters.clone, { id })).rejects.toThrow()
})

test("clone - throws if not character owner", async () => {
	const t = createConvexTest()
	const id = await t.run(async (ctx) => {
		const userId = await ctx.db.insert("users", {})
		return await ctx.db.insert(
			"characters",
			createCharacterDoc("Test Character", userId),
		)
	})

	const otherUserId = await t.run(async (ctx) => {
		return await ctx.db.insert("users", {})
	})
	const otherUser = t.withIdentity(createAuthToken(otherUserId))
	expect(
		otherUser.mutation(api.public.characters.clone, {
			id,
		}),
	).rejects.toThrow()
})

test("clone - clones character if logged in and character owner", async () => {
	const t = createConvexTest()
	const userId = await t.run(async (ctx) => {
		return await ctx.db.insert("users", {})
	})
	const user = t.withIdentity(createAuthToken(userId))

	const originalCharacter = createCharacterDoc("Test Character", userId)

	const id = await t.run(async (ctx) => {
		return await ctx.db.insert("characters", originalCharacter)
	})

	const clonedCharacter = await user.mutation(api.public.characters.clone, {
		id,
	})

	expect(clonedCharacter.fields.name).toContain(originalCharacter.fields!.name)
	expect(clonedCharacter.ownerId).toEqual(originalCharacter.ownerId)
})
