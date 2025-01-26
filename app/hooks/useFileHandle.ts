import { useCallback, useEffect, useState } from "react"
import { useDebouncedCallback } from "use-debounce"
import { ensure } from "~/utils.ts"

export function useFileHandle<T>(
	defaultData: T,
	options: {
		suggestedName?: string
		validator?: (data: unknown) => data is T
	} = {},
) {
	const [fileHandle, setFileHandle] = useState<FileSystemFileHandle | null>(
		null,
	)
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

	const createNew = useCallback(async () => {
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
	}, [defaultData, options.suggestedName])

	const open = useCallback(async () => {
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

			const file = await ensure(handle).getFile()
			const content = await file.text()
			const parsed = JSON.parse(content)

			if (options.validator && !options.validator(parsed)) {
				throw new Error("Invalid file format")
			}

			setFileHandle(ensure(handle))
			setData(parsed as T)
			return true
		} catch (error) {
			if (error instanceof Error && error.name === "AbortError") {
				return false
			}
			throw error
		}
	}, [options.validator])

	return {
		data,
		setData,
		fileHandle,
		createNew,
		open,
		hasFile: fileHandle !== null,
	}
}
