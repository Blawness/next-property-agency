"use client"

import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Phone, Calendar, Heart } from "lucide-react"
import { useFavorites } from "@/hooks/useFavorites"

interface Agent {
  fullName: string
  phone: string | null
  avatarUrl?: string | null
}

interface AgentCardProps {
  agent: Agent | null
  createdAt: Date | null
  propertyId?: string
  propertyTitle?: string
}

export default function AgentCard({ agent, createdAt, propertyId, propertyTitle }: AgentCardProps) {
  const { favorites, toggleFavorite } = useFavorites()
  const isFavorited = propertyId ? favorites.some((f) => f.id === propertyId) : false

  return (
    <div className="lg:col-span-1">
      <div className="sticky top-20 rounded-3xl bg-secondary/60 p-6 space-y-4 border border-border/40">
        <h3 className="font-sans text-lg font-semibold text-foreground">Hubungi Agen</h3>
        {agent ? (
          <>
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20 border-2 border-primary">
                {agent.avatarUrl ? (
                  <AvatarImage src={agent.avatarUrl} alt={agent.fullName} className="object-cover" />
                ) : null}
                <AvatarFallback className="text-2xl">
                  {agent.fullName[0]?.toUpperCase() ?? "A"}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="font-sans text-base font-semibold text-foreground truncate">{agent.fullName}</p>
                {agent.phone && (
                  <p className="text-sm text-muted-foreground truncate">{agent.phone}</p>
                )}
                <span className="mt-1.5 inline-flex items-center rounded-full bg-secondary text-primary px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em]">
                  Agen
                </span>
              </div>
            </div>
            {agent.phone && (
              <Button className="w-full rounded-xl bg-primary text-primary-foreground hover:bg-primary/90" asChild>
                <a
                  href={`https://wa.me/${agent.phone.replace(/\D/g, "")}?text=${encodeURIComponent(
                    `Halo, saya tertarik dengan properti "${propertyTitle ?? "ini"}". Bisa info lebih lanjut?`,
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Phone className="h-4 w-4 mr-2" />
                  WhatsApp
                </a>
              </Button>
            )}
            {propertyId ? (
              <Button
                variant="outline"
                className="w-full rounded-xl"
                onClick={() => toggleFavorite(propertyId)}
                aria-label={isFavorited ? "Hapus dari favorit" : "Simpan"}
              >
                <Heart
                  className={`h-4 w-4 mr-2 ${isFavorited ? "fill-primary text-primary" : ""}`}
                />
                Simpan
              </Button>
            ) : (
              <div className="flex items-center justify-center gap-1.5 rounded-xl border border-border py-2 text-sm text-muted-foreground">
                <Heart className="h-4 w-4" />
                Simpan
              </div>
            )}
          </>
        ) : (
          <p className="text-sm text-muted-foreground">Info agen tidak tersedia</p>
        )}
        <Separator />
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Calendar className="h-3.5 w-3.5" />
          <span>
            Diposting{" "}
            {createdAt
              ? new Date(createdAt).toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })
              : "-"}
          </span>
        </div>
      </div>
    </div>
  )
}
