"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { UploadButton } from "@uploadthing/react"
import type { OurFileRouter } from "@/lib/uploadthing"
import PropertyCard from "@/components/PropertyCard"
import { useFavorites } from "@/hooks/useFavorites"
import Reveal from "@/components/Reveal"
import ProfileSettings from "@/components/ProfileSettings"
import { Camera, Heart, Loader2 } from "lucide-react"
import { toast } from "sonner"

export default function ProfilPage() {
  const { data: session, status, update } = useSession()
  const isPending = status === "loading"
  const { favorites, loadingFavs } = useFavorites()
  const [uploading, setUploading] = useState(false)

  const saveAvatar = async (url: string) => {
    const res = await fetch("/api/profil", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ avatarUrl: url }),
    })
    if (!res.ok) {
      toast.error("Gagal menyimpan foto profil")
      return
    }
    await update({ image: url })
    toast.success("Foto profil diperbarui")
  }

  if (isPending) {
    return (
      <div className="container mx-auto px-4 py-8 space-y-4">
        <Skeleton className="h-24 w-full rounded-xl" />
        <Skeleton className="h-48 w-full rounded-xl" />
      </div>
    )
  }

  if (!session) {
    return (
      <div className="container mx-auto px-4 py-16 text-center space-y-4">
        <p className="text-muted-foreground">Kamu harus masuk terlebih dahulu.</p>
        <Button asChild>
          <Link href="/masuk">Masuk Sekarang</Link>
        </Button>
      </div>
    )
  }

  const userImage = session.user.image

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl space-y-8">
      <div className="flex items-center gap-5 pb-8 border-b border-border">
        <div className="relative group shrink-0">
          <Avatar className="h-20 w-20 border-2 border-primary">
            {userImage ? (
              <AvatarImage src={userImage} alt={session.user.name ?? ""} className="object-cover" />
            ) : null}
            <AvatarFallback className="text-2xl">
              {session.user.name?.[0]?.toUpperCase() ?? "U"}
            </AvatarFallback>
          </Avatar>
          <div className={`absolute inset-0 rounded-full flex items-center justify-center transition-opacity ${
            uploading ? "opacity-100 bg-primary/60" : "opacity-0 group-hover:opacity-100 bg-primary/40"
          }`}>
            {uploading ? (
              <Loader2 size={18} className="animate-spin text-primary-foreground" />
            ) : (
              <UploadButton<OurFileRouter, "profileImage">
                endpoint="profileImage"
                onUploadBegin={() => setUploading(true)}
                onClientUploadComplete={(res) => {
                  setUploading(false)
                  const url = res?.[0]?.ufsUrl
                  if (url) saveAvatar(url)
                }}
                onUploadError={(err) => {
                  setUploading(false)
                  toast.error(`Upload gagal: ${err.message}`)
                }}
                appearance={{
                  button: "h-20 w-20 rounded-full flex items-center justify-center bg-transparent hover:bg-transparent ut-ready:bg-transparent ut-uploading:bg-transparent",
                  container: "",
                  allowedContent: "hidden",
                }}
                content={{
                  button: <Camera size={18} className="text-primary-foreground" />,
                }}
              />
            )}
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="font-sans text-2xl font-semibold text-foreground truncate">{session.user.name}</h1>
          <p className="text-sm text-muted-foreground truncate">{session.user.email}</p>
          <span className="mt-2 inline-flex items-center rounded-full bg-primary px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-primary-foreground">
            {session.user.role === "admin" ? "Admin" : session.user.role === "agent" ? "Agen" : "Pembeli"}
          </span>
        </div>
      </div>

      <ProfileSettings />

      <div>
        <h2 className="text-xl font-semibold mb-4">Properti Favorit</h2>
        {loadingFavs ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[1, 2].map((i) => (
              <Skeleton key={i} className="h-64 rounded-xl" />
            ))}
          </div>
        ) : favorites.length === 0 ? (
          <div className="py-16 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border-2 border-primary text-primary">
              <Heart size={28} strokeWidth={1.5} />
            </div>
            <p className="mt-4 font-sans text-lg font-semibold text-foreground">Belum ada favorit</p>
            <Button className="mt-5 rounded-xl bg-primary px-5 text-primary-foreground hover:bg-primary/90" asChild>
              <Link href="/properti">Jelajahi Properti</Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {favorites.map((prop, i) => (
              <Reveal key={prop.id} delay={(i % 3) * 90}>
                <PropertyCard property={prop} />
              </Reveal>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
