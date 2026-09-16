"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { Heart } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

interface FavoriteButtonProps {
  propertyId: string
  initialFavorited?: boolean
  className?: string
}

export default function FavoriteButton({
  propertyId,
  initialFavorited = false,
  className,
}: FavoriteButtonProps) {
  const { data: session } = useSession()
  const [favorited, setFavorited] = useState(initialFavorited)
  const [pending, setPending] = useState(false)

  async function handleClick(e: React.MouseEvent) {
    // Prevent the parent <Link> from navigating when tapping the heart.
    e.preventDefault()
    e.stopPropagation()

    if (!session) {
      toast.error("Login untuk menyimpan favorit")
      return
    }
    if (pending) return

    const previous = favorited
    setFavorited(!previous)
    setPending(true)

    try {
      const res = await fetch("/api/favorites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ propertyId }),
      })
      if (!res.ok) throw new Error("Toggle failed")
      const data = await res.json()
      setFavorited(Boolean(data.favorited))
      toast.success(data.favorited ? "Disimpan ke favorit" : "Dihapus dari favorit")
    } catch {
      setFavorited(previous)
      toast.error("Gagal memperbarui favorit")
    } finally {
      setPending(false)
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={pending}
      aria-label={favorited ? "Hapus dari favorit" : "Simpan ke favorit"}
      aria-pressed={favorited}
      className={cn(
        "pointer-events-auto flex h-9 w-9 items-center justify-center rounded-full bg-black/40 backdrop-blur-sm transition-all hover:bg-black/60 disabled:opacity-60",
        className,
      )}
    >
      <Heart
        className={cn(
          "h-4 w-4 transition-colors",
          favorited ? "fill-primary text-primary" : "text-white",
        )}
      />
    </button>
  )
}
