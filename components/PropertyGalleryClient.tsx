"use client"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import { X, ChevronLeft, ChevronRight } from "lucide-react"
import type { PropertyImage } from "@/lib/types"

interface PropertyGalleryClientProps {
  images: PropertyImage[]
  title: string
}

export default function PropertyGalleryClient({ images, title }: PropertyGalleryClientProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
  const lightboxRef = useRef<HTMLDivElement>(null)
  const previousFocusRef = useRef<HTMLElement | null>(null)

  const openLightbox = (index: number) => {
    previousFocusRef.current = document.activeElement as HTMLElement
    setLightboxIndex(index)
  }
  const closeLightbox = () => {
    setLightboxIndex(null)
    previousFocusRef.current?.focus()
  }
  const prev = () => setLightboxIndex((i) => (i !== null && i > 0 ? i - 1 : i))
  const next = () => setLightboxIndex((i) => (i !== null && i < images.length - 1 ? i + 1 : i))

  useEffect(() => {
    if (lightboxIndex === null) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeLightbox()
      if (e.key === "ArrowLeft") prev()
      if (e.key === "ArrowRight") next()
    }
    document.addEventListener("keydown", handleKeyDown)
    requestAnimationFrame(() => lightboxRef.current?.focus())
    return () => document.removeEventListener("keydown", handleKeyDown)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lightboxIndex])

  if (images.length === 0) {
    return (
      <div className="grid grid-cols-1 h-72 sm:h-96 mb-6 rounded-xl overflow-hidden bg-muted">
        <div className="flex flex-col items-center justify-center text-muted-foreground gap-3">
          <div className="w-16 h-16 rounded-full bg-muted-foreground/10 flex items-center justify-center">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-muted-foreground/40">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <path d="M21 15l-5-5L5 21" />
            </svg>
          </div>
          <p className="text-sm">Belum ada foto properti</p>
        </div>
      </div>
    )
  }

  const primaryImage = images.find((img) => img.isPrimary) ?? images[0]
  const otherImages = images.filter((img) => img.id !== primaryImage?.id)

  return (
    <>
      <div className="grid grid-cols-3 gap-3 h-80 sm:h-[420px] mb-6 rounded-2xl overflow-hidden border border-border">
        <div
          onClick={() => openLightbox(0)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === "Enter" && openLightbox(0)}
          aria-label={`Lihat foto 1 dari ${images.length}`}
          className="col-span-2 relative bg-muted cursor-zoom-in group"
        >
          <Image
            src={primaryImage.url}
            alt={title}
            fill
            sizes="(max-width: 768px) 100vw, 66vw"
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            priority
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
        </div>
        <div className="grid grid-rows-2 gap-2">
          {otherImages.slice(0, 2).map((img, i) => (
            <div
              key={img.id}
              onClick={() => openLightbox(i + 1)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && openLightbox(i + 1)}
              aria-label={`Lihat foto ${i + 2} dari ${images.length}`}
              className="relative bg-muted cursor-zoom-in group"
            >
              <Image
                src={img.url}
                alt=""
                fill
                sizes="(max-width: 768px) 50vw, 33vw"
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
              {i === 1 && images.length > 3 && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <span className="text-white text-sm font-semibold">+{images.length - 3}</span>
                </div>
              )}
            </div>
          ))}
          {otherImages.length < 2 && (
            <div className="bg-muted rounded" />
          )}
        </div>
      </div>

      {/* Thumbnail strip */}
      {images.length > 1 && (
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2 -mt-4">
          {images.map((img, i) => (
            <button
              key={img.id}
              onClick={() => openLightbox(i)}
              aria-label={`Lihat foto ${i + 1} dari ${images.length}`}
              className="relative w-20 h-16 rounded-xl overflow-hidden shrink-0 border-2 border-transparent hover:border-primary transition-colors"
            >
              <Image
                src={img.url}
                alt=""
                fill
                sizes="80px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <div
          ref={lightboxRef}
          role="dialog"
          aria-modal="true"
          aria-label={`Galeri foto: ${title}`}
          tabIndex={-1}
          className="fixed inset-0 z-50 bg-accent/95 flex items-center justify-center outline-none"
          onClick={closeLightbox}
        >
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X size={20} />
          </button>

          {images.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); prev() }}
                className="absolute left-4 z-10 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                disabled={lightboxIndex === 0}
              >
                <ChevronLeft size={24} />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); next() }}
                className="absolute right-4 z-10 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                disabled={lightboxIndex === images.length - 1}
              >
                <ChevronRight size={24} />
              </button>
            </>
          )}

          <div className="relative w-full max-w-4xl h-[80vh] mx-4" onClick={(e) => e.stopPropagation()}>
            <Image
              src={images[lightboxIndex].url}
              alt={title}
              fill
              sizes="90vw"
              className="object-contain"
              priority
            />
          </div>

          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/60 text-sm">
            {lightboxIndex + 1} / {images.length}
          </div>
        </div>
      )}
    </>
  )
}
