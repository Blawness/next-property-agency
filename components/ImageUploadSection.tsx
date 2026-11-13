"use client"

import { useState } from "react"
import Image from "next/image"
import ImageUploadButton from "@/components/ImageUploadButton"
import { UPLOAD_KINDS, formatMegabytes } from "@/lib/upload-rules"
import { Label } from "@/components/ui/label"
import { ImagePlus, Loader2, X } from "lucide-react"

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
                aria-label={`Hapus foto ${i + 1}`}
                // Hover-only hid it on touch screens, where there is no hover,
                // and from keyboard users; it stays visible below `sm`.
                className="absolute top-1 right-1 bg-black/60 hover:bg-destructive text-white rounded-full p-0.5 transition-all sm:opacity-0 sm:group-hover:opacity-100 focus-visible:opacity-100"
              >
                <X size={10} />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className={`border-2 border-dashed rounded-lg text-center transition-colors ${
        uploading ? "border-primary/50 bg-primary/5" : "border-border hover:border-primary/50 hover:bg-primary/5"
      }`}>
        {uploading ? (
          <div className="p-4 flex items-center justify-center gap-2">
            <Loader2 size={18} className="animate-spin text-primary" />
            <span className="text-sm font-medium text-primary">Mengupload...</span>
          </div>
        ) : (
          <div className="p-3 flex flex-col items-center gap-1.5">
            <ImageUploadButton
              kind="propertyImages"
              onUploadBegin={() => setUploading(true)}
              onUploadComplete={(urls) => {
                setImageUrls((prev) => [...prev, ...urls])
                setUploading(false)
              }}
              onError={(msg) => onError(`Upload error: ${msg}`)}
            >
              <ImagePlus /> Pilih Foto
            </ImageUploadButton>
            <p className="text-xs text-muted-foreground">
              Maks {UPLOAD_KINDS.propertyImages.maxFiles} foto, {formatMegabytes(UPLOAD_KINDS.propertyImages.maxBytes)} per foto
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
