import { useEffect, useState } from "react"
import { useDebouncedCallback } from "use-debounce"
import { ensure } from "~/utils.ts"

export function useFileHandle<T>(
	defaultData: T,
	validate: (data: unknown) => T,
	options: {
		suggestedName?: string
		initialHandle?: FileSystemFileHandle
	} = {},
) {
	const [fileHandle, setFileHandle] = useState(options.initialHandle)
	const [data, setData] = useState<T>(defaultData)

	const saveToFile = useDebouncedCallback(
		async (handle: FileSystemFileHandle, newData: T) => {
			const writable = await handle.createWritable()
			await writable.write(JSON.stringify(newData, null, 2))
			await writable.close()
		},
		1000,
	)

	useEffect(() => {
		if (fileHandle) {
			saveToFile(fileHandle, data)
		}
	}, [data, fileHandle, saveToFile])

	async function createNew() {
		try {
			const handle = await window.showSaveFilePicker({
				suggestedName: options.suggestedName,
				types: [
					{
						description: "JSON File",
						accept: { "application/json": [".json"] },
					},
				],
			})

			setFileHandle(handle)
			setData(defaultData)
			return true
		} catch (error) {
			if (error instanceof Error && error.name === "AbortError") {
				return false
			}
			throw error
		}
	}

	async function load(handle: FileSystemFileHandle) {
		const file = await ensure(handle).getFile()
		const content = await file.text()
		const parsed = JSON.parse(content)
		return validate(parsed)
	}

	async function open() {
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

			const data = await load(ensure(handle))
			setFileHandle(ensure(handle))
			setData(data)
			return true
		} catch (error) {
			if (error instanceof Error && error.name === "AbortError") {
				return false
			}
			throw error
		}
	}

	return {
		data,
		setData,
		fileHandle,
		createNew,
		open,
		hasFile: fileHandle !== null,
	}
}
