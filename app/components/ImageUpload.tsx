import { Icon } from "@iconify/react"
import { useRef, useState } from "react"
import { Button } from "./Button.tsx"

interface ImageUploadProps {
	imageId?: string | null
	onUpload: (imageId: string) => void
}

export function ImageUpload({ imageId, onUpload }: ImageUploadProps) {
	const [isUploading, setIsUploading] = useState(false)
	const fileInputRef = useRef<HTMLInputElement>(null)

	async function handleUpload(file: File) {
		setIsUploading(true)
		try {
			const formData = new FormData()
			formData.append("file", file)

			const response = await fetch("/images/upload", {
				method: "POST",
				body: formData,
			})

			if (!response.ok) {
				throw new Error("Upload failed")
			}

			const { id } = await response.json()
			onUpload(id)
		} catch (error) {
			console.error("Upload failed:", error)
		} finally {
			setIsUploading(false)
		}
	}

	return (
		<div className="relative group">
			{imageId ? (
				<img
					src={`/images/${imageId}`}
					alt="Character"
					className="w-full h-full object-cover rounded-lg"
				/>
			) : (
				<div className="h-full flex items-center justify-center">
					<p className="text-center text-gray-400">
						Click to upload character image
					</p>
				</div>
			)}

			<Button
				type="button"
				onClick={() => fileInputRef.current?.click()}
				disabled={isUploading}
				className="
					absolute inset-0 w-full h-full rounded-lg
					opacity-0 group-hover:opacity-100
					bg-black/50 backdrop-blur-sm
					flex items-center justify-center
					transition
				"
			>
				<Icon
					icon={
						isUploading ? "mingcute:loading-fill" : "mingcute:upload-2-fill"
					}
					className={`w-8 h-8 ${isUploading ? "animate-spin" : ""}`}
				/>
			</Button>

			<input
				ref={fileInputRef}
				type="file"
				accept="image/*"
				className="hidden"
				onChange={(event) => {
					const file = event.target.files?.[0]
					if (file) {
						handleUpload(file)
					}
				}}
			/>
		</div>
	)
}
