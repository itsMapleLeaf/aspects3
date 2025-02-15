export class SafeMap<Key, Item> {
	readonly #items: Map<Key, Item>

	constructor(items: Map<Key, Item>) {
		this.#items = items
	}

	get(key: Key) {
		return this.#items.get(key) as Item
	}

	keys() {
		return [...this.#items.keys()]
	}

	values() {
		return Object.keys(this.#items) as Key[]
	}

	entries() {}

	get keyType(): Key {
		throw new Error("Attempt to access type-only property")
	}

	get itemType(): Key {
		throw new Error("Attempt to access type-only property")
	}
}
