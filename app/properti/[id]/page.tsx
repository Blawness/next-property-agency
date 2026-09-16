import { notFound } from "next/navigation"
import Link from "next/link"
import { Metadata } from "next"
import { db } from "@/db"
import { properties, propertyImages, profiles } from "@/db/schema"
import { eq, and, isNull } from "drizzle-orm"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { MapPin, ExternalLink, ChevronRight } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import PropertyMap from "@/components/PropertyMap"
import PropertyGalleryClient from "@/components/PropertyGalleryClient"
import PropertySpecs from "@/components/PropertySpecs"
import AgentCard from "@/components/AgentCard"
import PropertyLeadForm from "@/components/PropertyLeadForm"
import { formatPriceFull, PROPERTY_TYPE_LABELS } from "@/lib/constants"
import { BRAND } from "@/lib/brand"

export const revalidate = 300

interface PageProps {
  params: Promise<{ id: string }>
}

async function getProperty(id: string) {
  const [property] = await db
    .select()
    .from(properties)
    .where(and(eq(properties.id, id), isNull(properties.deletedAt)))
    .limit(1)

  if (!property) return null

  const [images, agent] = await Promise.all([
    db
      .select()
      .from(propertyImages)
      .where(eq(propertyImages.propertyId, id))
      .orderBy(propertyImages.order),
    property.agentId
      ? db
          .select()
          .from(profiles)
          .where(eq(profiles.id, property.agentId))
          .limit(1)
          .then((r) => r[0])
      : null,
  ])

  return { property, images, agent }
}

function buildJsonLd(property: typeof properties.$inferSelect, images: Array<typeof propertyImages.$inferSelect>) {
  const primary = images.find((i) => i.isPrimary) ?? images[0]
  return {
    "@context": "https://schema.org",
    "@type": "Residence" as const,
    name: property.title,
    description: property.description ?? undefined,
    url: `/properti/${property.id}`,
    image: primary ? [primary.url] : undefined,
    address: {
      "@type": "PostalAddress" as const,
      addressLocality: property.city,
      streetAddress: property.address ?? undefined,
      addressCountry: "ID",
    },
    geo: property.lat && property.lng ? {
      "@type": "GeoCoordinates" as const,
      latitude: Number(property.lat),
      longitude: Number(property.lng),
    } : undefined,
    numberOfRooms: property.bedrooms ?? undefined,
    offers: {
      "@type": "Offer" as const,
      price: property.price,
      priceCurrency: "IDR",
      availability: property.status === "active"
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
    },
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params
  const data = await getProperty(id)

  if (!data) return { title: BRAND.pageTitle.propertyNotFound }

  const { property, images } = data
  const primaryImage = images.find((img) => img.isPrimary) ?? images[0]
  const formattedPrice = formatPriceFull(property.price, property.listingType)

  const description = property.description
    ? property.description.slice(0, 160)
    : `${property.title} di ${property.city} — ${formattedPrice}`

  const baseUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3000"
  return {
    title: `${property.title} — ${formattedPrice} | ${BRAND.name}`,
    description,
    alternates: { canonical: `${baseUrl}/properti/${property.id}` },
    openGraph: {
      title: property.title,
      description,
      type: "article",
      url: `${baseUrl}/properti/${property.id}`,
      siteName: BRAND.name,
      locale: "id_ID",
      images: primaryImage ? [{ url: primaryImage.url, width: 1200, height: 630, alt: property.title }] : [],
    },
    twitter: {
      card: "summary_large_image",
      title: property.title,
      description,
      images: primaryImage ? [primaryImage.url] : [],
    },
  }
}

export default async function PropertyDetailPage({ params }: PageProps) {
  const { id } = await params
  const data = await getProperty(id)

  if (!data || data.property.status === "archived") notFound()

  const { property, images, agent } = data
  const formattedPrice = formatPriceFull(property.price, property.listingType)

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl animate-in fade-in duration-300">
      <nav aria-label="Breadcrumb" className="mb-5">
        <ol className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <li>
            <Link href="/" className="transition-colors hover:text-primary">Beranda</Link>
          </li>
          <li aria-hidden className="flex items-center">
            <ChevronRight className="h-3.5 w-3.5" />
          </li>
          <li>
            <Link href="/properti" className="transition-colors hover:text-primary">Katalog</Link>
          </li>
          <li aria-hidden className="flex items-center">
            <ChevronRight className="h-3.5 w-3.5" />
          </li>
          <li aria-current="page" className="line-clamp-1 max-w-[220px] font-medium text-foreground sm:max-w-[320px]">
            {property.title}
          </li>
        </ol>
      </nav>

      <PropertyGalleryClient images={images} title={property.title} />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(buildJsonLd(property, images)) }}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="space-y-3">
            <p className="font-sans text-3xl font-bold text-primary sm:text-4xl">
              {formattedPrice}
              {property.listingType === "sewa" && (
                <span className="ml-1 text-base font-normal text-muted-foreground">/bulan</span>
              )}
            </p>
            <div className="flex flex-wrap gap-2">
              <Badge variant={property.listingType === "jual" ? "default" : "secondary"} className="rounded-full">
                {property.listingType === "jual" ? "Dijual" : "Disewa"}
              </Badge>
              <Badge variant="outline" className="rounded-full">{PROPERTY_TYPE_LABELS[property.type]}</Badge>
              {property.status !== "active" && (
                <Badge variant="destructive" className="rounded-full">
                  {property.status === "sold" ? "Terjual" : "Tersewa"}
                </Badge>
              )}
            </div>
            <h1 className="font-sans text-2xl font-semibold text-foreground sm:text-3xl">{property.title}</h1>
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4 text-primary" />
              <span>
                {property.address ? `${property.address}, ` : ""}
                {property.city}
              </span>
            </div>
          </div>

          <Separator />

          <PropertySpecs
            bedrooms={property.bedrooms}
            bathrooms={property.bathrooms}
            buildingArea={property.buildingArea}
            landArea={property.landArea}
          />

          {property.description && (
            <>
              <Separator />
              <div>
                <h2 className="font-sans text-xl font-semibold text-foreground mb-3">
                  Tentang Properti Ini
                </h2>
                <p className="whitespace-pre-line leading-relaxed text-foreground/85">
                  {property.description}
                </p>
              </div>
            </>
          )}

          {property.lat && property.lng && (
            <>
              <Separator />
              <div>
                <h2 className="font-sans text-xl font-semibold text-foreground mb-3">Lokasi</h2>
                  <PropertyMap
                    lat={parseFloat(property.lat)}
                    lng={parseFloat(property.lng)}
                    title={property.title}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-3 w-full"
                    asChild
                  >
                    <a
                      href={`https://www.google.com/maps?q=${property.lat},${property.lng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink size={14} className="mr-1.5" />
                      Buka di Google Maps
                    </a>
                  </Button>
              </div>
            </>
          )}

          <Separator />

          <PropertyLeadForm propertyId={property.id} propertyTitle={property.title} />
        </div>

        <AgentCard
          agent={agent ? { fullName: agent.fullName, phone: agent.phone, avatarUrl: agent.avatarUrl } : null}
          createdAt={property.createdAt}
          propertyId={property.id}
          propertyTitle={property.title}
        />
      </div>
    </div>
  )
}
