interface FileSystemHandle {
	readonly kind: "file" | "directory"
	readonly name: string

	isSameEntry(other: FileSystemHandle): Promise<boolean>
}

interface FileSystemFileHandle extends FileSystemHandle {
	readonly kind: "file"

	getFile(): Promise<File>
	createWritable(
		options?: FileSystemCreateWritableOptions,
	): Promise<FileSystemWritableFileStream>
}

interface FileSystemCreateWritableOptions {
	keepExistingData?: boolean
}

interface FileSystemWritableFileStream extends WritableStream {
	write(data: BufferSource | Blob | string): Promise<void>
	seek(position: number): Promise<void>
	truncate(size: number): Promise<void>
}

interface Window {
	showOpenFilePicker(options?: {
		multiple?: boolean
		excludeAcceptAllOption?: boolean
		types?: {
			description?: string
			accept: Record<string, string[]>
		}[]
	}): Promise<FileSystemFileHandle[]>

	showSaveFilePicker(options?: {
		excludeAcceptAllOption?: boolean
		suggestedName?: string
		types?: {
			description?: string
			accept: Record<string, string[]>
		}[]
	}): Promise<FileSystemFileHandle>
}
