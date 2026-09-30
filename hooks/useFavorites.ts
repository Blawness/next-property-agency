"use client"

import { useEffect, useState, useCallback } from "react"
import { useSession } from "next-auth/react"
import { toast } from "sonner"
import type { PropertyWithImages } from "@/lib/types"

async function fetchFavorites(): Promise<PropertyWithImages[]> {
  const r = await fetch("/api/favorites")
  if (!r.ok) throw new Error("Failed to fetch favorites")
  const data = await r.json()
  return data.favorites ?? []
}

export function useFavorites() {
  const { data: session } = useSession()
  const [favorites, setFavorites] = useState<PropertyWithImages[]>([])
  const [loadingFavs, setLoadingFavs] = useState(true)
  const [error, setError] = useState("")
  const [pending, setPending] = useState(false)

  useEffect(() => {
    if (!session) return
    fetchFavorites()
      .then(setFavorites)
      .catch((err) => { setError(err.message); setFavorites([]) })
      .finally(() => setLoadingFavs(false))
  }, [session])

  const toggleFavorite = useCallback(async (propertyId: string) => {
    if (!session) {
      toast.error("Login untuk menyimpan favorit")
      return
    }
    if (pending) return

    const previous = favorites
    const isCurrentlyFavorited = favorites.some((f) => f.id === propertyId)
    // Removal can be shown at once. An addition cannot: the list holds whole
    // listings and this caller has only an id, so it is reloaded below.
    if (isCurrentlyFavorited) setFavorites(favorites.filter((f) => f.id !== propertyId))
    setPending(true)

    try {
      const res = await fetch("/api/favorites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ propertyId }),
      })
      if (!res.ok) throw new Error("Toggle failed")
      const data = await res.json()
      if (data.favorited) setFavorites(await fetchFavorites())
      toast.success(data.favorited ? "Disimpan ke favorit" : "Dihapus dari favorit")
    } catch {
      setFavorites(previous)
      toast.error("Gagal memperbarui favorit")
    } finally {
      setPending(false)
    }
  }, [session, favorites, pending])

  return { favorites, loadingFavs, error, pending, toggleFavorite }
}
