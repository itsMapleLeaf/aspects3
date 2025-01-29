import { isEqual } from "es-toolkit"
import { useEffect, useRef, useState } from "react"
import { useSearchParams } from "react-router"
import { Character } from "~/data/characters.ts"
import { ensure, timeoutEffect } from "~/utils.ts"
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

	const [searchParams, setSearchParams] = useSearchParams()
	const dataParam = searchParams.get("data")
	useEffect(() => {
		if (!dataParam) return

		try {
			const dataParam = new URLSearchParams(location.search).get("data")
			if (!dataParam) return

			const sharedCharacter = Character.assert(JSON.parse(atob(dataParam)))
			setCharacter(sharedCharacter)
			setSearchParams((params) => {
				params.delete("data")
				return params
			})
		} catch (error) {
			console.error("Failed to parse character", error)
		}
	}, [dataParam])

	useEffect(() => {
		const shouldSave = fileHandle != null && autoSave
		if (!shouldSave) return

		return timeoutEffect(500, () => {
			void (async () => {
				try {
					await saveToFile(fileHandle, character)
				} catch (error) {
					console.error("Failed to save:", error)
					// TODO: show this in UI
				}
			})()
		})
	}, [character, fileHandle, autoSave])

	async function save() {
		try {
			const [firstName] = character.name.toLowerCase().matchAll(/\S+/g)
			const suggestedName = firstName?.[0] || "character.json"

			if (!hasFileSystemAccess) {
				const blob = new Blob([JSON.stringify(character, null, 2)], {
					type: "application/json",
				})
				const url = URL.createObjectURL(blob)
				const a = document.createElement("a")
				a.href = url
				a.download = suggestedName
				a.click()
				URL.revokeObjectURL(url)
				return
			}

			const handle = await window.showSaveFilePicker({
				suggestedName,
				types: [
					{
						description: "JSON File",
						accept: { "application/json": [".json"] },
					},
				],
			})

			setFileHandle(handle)
		} catch (error) {
			if (error instanceof Error && error.name === "AbortError") {
				return
			}
			alert(error)
			throw error
		}
	}

	async function loadFile(file: File) {
		const content = await file.text()
		const parsed = JSON.parse(content)
		return Character.assert(parsed)
	}

	async function open() {
		try {
			if (hasFileSystemAccess) {
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
		} catch (error) {
			if (error instanceof Error && error.name === "AbortError") {
				return
			}
			alert(error)
			throw error
		}
		return
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

async function saveToFile(
	fileHandle: FileSystemFileHandle,
	character: Character,
) {
	const writable = await fileHandle.createWritable()
	await writable.write(JSON.stringify(character, null, 2))
	await writable.close()
	console.debug("Saved to", fileHandle.name)
}
