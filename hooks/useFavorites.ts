"use client"

import { useEffect, useState, useCallback } from "react"
import { useSession } from "next-auth/react"
import { toast } from "sonner"
import type { PropertyWithImages } from "@/lib/types"

export function useFavorites() {
  const { data: session } = useSession()
  const [favorites, setFavorites] = useState<PropertyWithImages[]>([])
  const [loadingFavs, setLoadingFavs] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    if (!session) return
    fetch("/api/favorites")
      .then((r) => {
        if (!r.ok) throw new Error("Failed to fetch favorites")
        return r.json()
      })
      .then((data) => setFavorites(data.favorites ?? []))
      .catch((err) => { setError(err.message); setFavorites([]) })
      .finally(() => setLoadingFavs(false))
  }, [session])

  const toggleFavorite = useCallback(async (propertyId: string) => {
    if (!session) {
      toast.error("Login untuk menyimpan favorit")
      return
    }

    const previous = favorites
    const isCurrentlyFavorited = favorites.some((f) => f.id === propertyId)
    setFavorites(isCurrentlyFavorited ? favorites.filter((f) => f.id !== propertyId) : favorites)

    try {
      const res = await fetch("/api/favorites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ propertyId }),
      })
      if (!res.ok) throw new Error("Toggle failed")
    } catch {
      setFavorites(previous)
      toast.error("Gagal memperbarui favorit")
    }
  }, [session, favorites])

  return { favorites, loadingFavs, error, toggleFavorite }
}
