import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { db } from "@/db"
import { properties } from "@/db/schema"
import { and, desc, eq, isNull } from "drizzle-orm"
import { getPublicAgent, getPropertiesWithImagesBatch } from "@/lib/db-helpers"
import PropertyCard from "@/components/PropertyCard"
import SectionHeading from "@/components/SectionHeading"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { buildAgentWhatsAppLink } from "@/lib/whatsapp"
import { BRAND, brandTitle } from "@/lib/brand"
import { SITE_URL } from "@/lib/constants"
import type { PublicAgent } from "@/lib/types"
import { Phone, Calendar, Home } from "lucide-react"

export const revalidate = 300

interface PageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params
  const agent = await getPublicAgent(id)

  if (!agent) return { title: brandTitle("Agen Tidak Ditemukan") }

  // brandTitle() already appends the brand — naming it again here gave
  // "Ahmad Rahman — Agen PROPERTI NUSA — PROPERTI NUSA".
  const role = agent.title ?? `agen ${BRAND.name}`
  return {
    title: brandTitle(agent.title ? `${agent.fullName} — ${agent.title}` : agent.fullName),
    description:
      agent.bio ??
      `${agent.fullName}, ${role}. Lihat ${agent.listingCount} listing aktif dan hubungi langsung.`,
  }
}

function buildJsonLd(agent: PublicAgent) {
  return {
    "@context": "https://schema.org",
    "@type": "RealEstateAgent",
    name: agent.fullName,
    url: `${SITE_URL}/agen/${agent.id}`,
    ...(agent.title ? { jobTitle: agent.title } : {}),
    ...(agent.bio ? { description: agent.bio } : {}),
    ...(agent.avatarUrl ? { image: agent.avatarUrl } : {}),
    ...(agent.phone ? { telephone: agent.phone } : {}),
    worksFor: { "@type": "Organization", name: BRAND.name },
  }
}

export default async function AgenDetailPage({ params }: PageProps) {
  const { id } = await params
  const agent = await getPublicAgent(id)

  if (!agent) notFound()

  const listings = await getPropertiesWithImagesBatch(
    db
      .select()
      .from(properties)
      .where(
        and(
          eq(properties.agentId, agent.id),
          eq(properties.status, "active"),
          isNull(properties.deletedAt),
        ),
      )
      .orderBy(desc(properties.createdAt)),
  )

  const whatsappHref = buildAgentWhatsAppLink({
    agentName: agent.fullName,
    phone: agent.phone,
  })

  return (
    <div className="container mx-auto px-4 py-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(buildJsonLd(agent)) }}
      />

      <div className="rounded-sm bg-accent p-8 text-accent-foreground sm:p-10">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
          <Avatar className="h-28 w-28 shrink-0 border-2 border-gold">
            {agent.avatarUrl ? (
              <AvatarImage src={agent.avatarUrl} alt={agent.fullName} className="object-cover" />
            ) : null}
            <AvatarFallback className="bg-warm text-3xl text-accent-foreground">
              {agent.fullName[0]?.toUpperCase() ?? "A"}
            </AvatarFallback>
          </Avatar>

          <div className="min-w-0 flex-1">
            <h1 className="font-sans text-[30px] font-bold leading-tight sm:text-[36px]">
              {agent.fullName}
            </h1>
            {agent.title && (
              <p className="mt-1 text-[14px] uppercase tracking-[0.16em] text-gold">
                {agent.title}
              </p>
            )}

            {agent.bio && (
              <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-accent-foreground/85">
                {agent.bio}
              </p>
            )}

            <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-[13px] text-accent-foreground/70">
              <span className="flex items-center gap-1.5">
                <Home className="h-3.5 w-3.5" aria-hidden />
                {agent.listingCount > 0
                  ? `${agent.listingCount} listing aktif`
                  : "Belum ada listing aktif"}
              </span>
              {agent.createdAt && (
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" aria-hidden />
                  Bergabung{" "}
                  {new Date(agent.createdAt).toLocaleDateString("id-ID", {
                    month: "long",
                    year: "numeric",
                  })}
                </span>
              )}
            </div>

            {whatsappHref && (
              <Button
                className="mt-6 rounded-sm bg-primary text-primary-foreground hover:bg-primary/90"
                asChild
              >
                <a href={whatsappHref} target="_blank" rel="noopener noreferrer">
                  <Phone className="mr-2 h-4 w-4" />
                  Hubungi via WhatsApp
                </a>
              </Button>
            )}
          </div>
        </div>
      </div>

      <Separator className="my-10" />

      <SectionHeading eyebrow="Portofolio" title={`Listing oleh ${agent.fullName}`} />

      {listings.length === 0 ? (
        <p className="rounded-sm border border-border bg-card py-16 text-center text-sm text-muted-foreground">
          Agen ini belum punya listing aktif.
        </p>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {listings.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
      )}
    </div>
  )
}
