"use client"

import { useState } from "react"
import Image from "next/image"
import { UploadButton } from "@uploadthing/react"
import type { OurFileRouter } from "@/lib/uploadthing"
import { Label } from "@/components/ui/label"
import { Loader2, X } from "lucide-react"

interface ImageUploadSectionProps {
  imageUrls: string[]
  setImageUrls: React.Dispatch<React.SetStateAction<string[]>>
  onError: (msg: string) => void
}

export default function ImageUploadSection({ imageUrls, setImageUrls, onError }: ImageUploadSectionProps) {
  const [uploading, setUploading] = useState(false)

  const removeImage = (index: number) => {
    setImageUrls((prev) => prev.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-3 col-span-2">
      <Label>Foto Properti {imageUrls.length > 0 && `(${imageUrls.length})`}</Label>

      {imageUrls.length > 0 && (
        <div className="grid grid-cols-4 sm:grid-cols-5 lg:grid-cols-6 gap-2">
          {imageUrls.map((url, i) => (
            <div key={url + i} className="relative aspect-square rounded-lg overflow-hidden bg-muted group">
              <Image
                src={url}
                alt={`Foto ${i + 1}`}
                fill
                sizes="(max-width: 640px) 25vw, 16vw"
                className="object-cover"
              />
              <button
                type="button"
                onClick={() => removeImage(i)}
                className="absolute top-1 right-1 bg-black/60 hover:bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-all"
              >
                <X size={10} />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className={`border-2 border-dashed rounded-lg text-center transition-colors ${
        uploading ? "border-brown-300 bg-brown-50/50" : "border-border hover:border-brown-300 hover:bg-brown-50/30"
      }`}>
        {uploading ? (
          <div className="p-4 flex items-center justify-center gap-2">
            <Loader2 size={18} className="animate-spin text-brown-500" />
            <span className="text-sm font-medium text-brown-700">Mengupload...</span>
          </div>
        ) : (
          <div className="p-3">
            <UploadButton<OurFileRouter, "propertyImages">
              endpoint="propertyImages"
              onUploadBegin={() => setUploading(true)}
              onClientUploadComplete={(res) => {
                setImageUrls((prev) => [...prev, ...res.map((r) => r.ufsUrl)])
                setUploading(false)
              }}
              onUploadError={(err) => {
                onError(`Upload error: ${err.message}`)
                setUploading(false)
              }}
              appearance={{
                button: "bg-brown-500 hover:bg-brown-600 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors ut-ready:bg-brown-500 ut-uploading:bg-brown-400",
                container: "",
                allowedContent: "text-muted-foreground text-xs",
              }}
            />
          </div>
        )}
      </div>
    </div>
  )
}
