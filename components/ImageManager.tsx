"use client"

import { useState } from "react"
import Image from "next/image"
import ImageUploadButton from "@/components/ImageUploadButton"
import { UPLOAD_KINDS, formatMegabytes } from "@/lib/upload-rules"
import { Label } from "@/components/ui/label"
import { X, Loader2, ImagePlus } from "lucide-react"

interface ImageManagerProps {
  imageUrls: string[]
  setImageUrls: React.Dispatch<React.SetStateAction<string[]>>
  onError: (msg: string) => void
}

export default function ImageManager({ imageUrls, setImageUrls, onError }: ImageManagerProps) {
  const [uploading, setUploading] = useState(false)
  const [uploadingCount, setUploadingCount] = useState(0)

  const removeImage = (index: number) => {
    setImageUrls((prev) => prev.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-3">
      <Label>Foto Properti ({imageUrls.length})</Label>

      {imageUrls.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-3">
          {imageUrls.map((url, i) => (
            <div key={url + i} className="relative aspect-square rounded-lg overflow-hidden bg-muted group">
              <Image
                src={url}
                alt={`Foto ${i + 1}`}
                fill
                sizes="(max-width: 640px) 33vw, 20vw"
                className="object-cover"
              />
              {i === 0 && (
                <span className="absolute top-1.5 left-1.5 bg-primary text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                  Utama
                </span>
              )}
              <button
                type="button"
                onClick={() => removeImage(i)}
                aria-label={`Hapus foto ${i + 1}`}
                // Hover-only hid it on touch screens, where there is no hover,
                // and from keyboard users; it stays visible below `sm`.
                className="absolute top-1.5 right-1.5 bg-black/60 hover:bg-destructive text-white rounded-full p-1 transition-all sm:opacity-0 sm:group-hover:opacity-100 focus-visible:opacity-100"
              >
                <X size={12} />
              </button>
            </div>
          ))}
          {/* Uploading placeholders */}
          {uploading && Array.from({ length: uploadingCount }).map((_, i) => (
            <div key={`loading-${i}`} className="relative aspect-square rounded-lg overflow-hidden bg-primary/10 border-2 border-primary/30 flex items-center justify-center">
              <Loader2 size={20} className="animate-spin text-primary" />
            </div>
          ))}
        </div>
      )}

      <div className={`border-2 border-dashed rounded-lg text-center transition-colors ${
        uploading
          ? "border-primary/50 bg-primary/5"
          : "border-border hover:border-primary/50 hover:bg-primary/5"
      }`}>
        {uploading ? (
          <div className="p-6 flex flex-col items-center gap-2">
            <Loader2 size={24} className="animate-spin text-primary" />
            <p className="text-sm font-medium text-primary">Mengupload...</p>
            <p className="text-xs text-primary/70">Jangan tutup halaman ini</p>
          </div>
        ) : (
          <div className="p-6 flex flex-col items-center gap-2">
            <ImageUploadButton
              kind="propertyImages"
              onUploadBegin={(count) => {
                setUploadingCount(count)
                setUploading(true)
              }}
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
