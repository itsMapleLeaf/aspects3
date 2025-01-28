import { isEqual } from "es-toolkit"
import { useEffect, useRef, useState } from "react"
import { useDebouncedCallback } from "use-debounce"
import { Character } from "~/data/characters.ts"
import { ensure } from "~/utils.ts"
import { useLocalStorage } from "./useLocalStorage.ts"

const hasFileSystemAccess =
	typeof window !== "undefined" && "showSaveFilePicker" in window

export function useCharacterStorage(defaultCharacter: Character) {
	const [fileHandle, setFileHandle] = useState<FileSystemFileHandle>()
	const [autoSave, setAutoSave] = useLocalStorage("autoSave", false, Boolean)
	const [character, setCharacter] = useLocalStorage(
		"currentCharacter",
		defaultCharacter,
		Character.assert,
	)
	const fileInputRef = useRef<HTMLInputElement | undefined>(undefined)

	const hasFile = fileHandle != null

	const saveToFile = useDebouncedCallback(
		async (handle: FileSystemFileHandle, data: Character) => {
			const writable = await handle.createWritable()
			await writable.write(JSON.stringify(data, null, 2))
			await writable.close()
		},
		1000,
	)

	useEffect(() => {
		if (fileHandle && autoSave) {
			saveToFile(fileHandle, character)
		}
	}, [character, fileHandle, autoSave, saveToFile])

	async function save() {
		if (!hasFileSystemAccess) {
			const blob = new Blob([JSON.stringify(character, null, 2)], {
				type: "application/json",
			})
			const url = URL.createObjectURL(blob)
			const a = document.createElement("a")
			a.href = url
			a.download = "character.aspects.json"
			a.click()
			URL.revokeObjectURL(url)
			return
		}

		try {
			const handle =
				fileHandle ??
				(await window.showSaveFilePicker({
					suggestedName: "character.aspects.json",
					types: [
						{
							description: "JSON File",
							accept: { "application/json": [".json"] },
						},
					],
				}))

			setFileHandle(handle)
			await saveToFile(handle, character)
		} catch (error) {
			if (error instanceof Error && error.name === "AbortError") {
				return
			}
			throw error
		}
	}

	async function loadFile(file: File) {
		const content = await file.text()
		const parsed = JSON.parse(content)
		return Character.assert(parsed)
	}

	async function open() {
		if (hasFileSystemAccess) {
			try {
				const [handle] = await window.showOpenFilePicker({
					multiple: false,
					types: [
						{
							description: "JSON File",
							accept: { "application/json": [".json"] },
						},
					],
				})

				const data = await loadFile(await ensure(handle).getFile())
				setFileHandle(ensure(handle))
				setCharacter(data)
			} catch (error) {
				if (error instanceof Error && error.name === "AbortError") {
					return
				}
				throw error
			}
			return
		}

		// create a file input if it doesn't exist
		if (!fileInputRef.current) {
			const input = document.createElement("input")
			input.type = "file"
			input.accept = ".json,application/json"
			fileInputRef.current = input

			input.addEventListener("change", async () => {
				const file = input.files?.[0]
				if (!file) return

				const data = await loadFile(file)
				setCharacter(data)

				// reset the input so the same file can be selected again
				input.value = ""
			})
		}

		fileInputRef.current.click()
	}

	function clearFile() {
		setFileHandle(undefined)
	}

	function createNew() {
		const hasChanges = !isEqual(character, defaultCharacter)
		if (
			!hasChanges ||
			confirm(
				"Are you sure you want to start a new character? Any unsaved changes will be lost.",
			)
		) {
			setCharacter(defaultCharacter)
			clearFile()
		}
	}

	return {
		character,
		setCharacter,
		fileHandle,
		hasFileSystemAccess,
		hasFile,
		autoSave,
		setAutoSave,
		save,
		open,
		createNew,
	}
}
