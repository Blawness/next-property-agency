import Link from "next/link"
import Image from "next/image"
import { ArrowUpRight } from "lucide-react"
import type { PropertyWithImages } from "@/lib/types"
import {
  formatPriceCompactValue,
  LISTING_TYPE_LABELS,
  PROPERTY_TYPE_LABELS,
  SITE_URL,
} from "@/lib/constants"
import { BRAND } from "@/lib/brand"
import { buildWhatsAppLink } from "@/lib/whatsapp"
import FavoriteButton from "@/components/FavoriteButton"

/** "3 KT · 2 KM · 120 m²", or the land area alone for tanah. */
export function listingSpecs(property: PropertyWithImages): string {
  if (property.type === "tanah") {
    return property.landArea != null ? `${property.landArea} m² tanah` : ""
  }
  return [
    property.bedrooms != null ? `${property.bedrooms} KT` : null,
    property.bathrooms != null ? `${property.bathrooms} KM` : null,
    property.buildingArea != null ? `${property.buildingArea} m²` : null,
  ]
    .filter(Boolean)
    .join(" · ")
}

/**
 * The homepage's editorial listing card: a tall photograph, a serif title and
 * a quiet price line. The catalogue and agent pages keep `PropertyCard`, whose
 * denser layout suits scanning a long grid; this one is for a curated six.
 */
export default function HomeListingCard({
  property,
  initialFavorited = false,
  priority = false,
}: {
  property: PropertyWithImages
  initialFavorited?: boolean
  priority?: boolean
}) {
  const image = property.images.find((i) => i.isPrimary) ?? property.images[0]
  const price = formatPriceCompactValue(property.price, property.listingType)
  const specs = listingSpecs(property)
  const whatsappHref = buildWhatsAppLink({
    title: property.title,
    price: property.price,
    listingType: property.listingType,
    url: `${SITE_URL}/properti/${property.id}`,
    agentPhone: property.agentPhone,
    officePhone: BRAND.contact.whatsapp,
  })

  return (
    <article className="group relative">
      <Link href={`/properti/${property.id}`} className="block">
        <div className="relative aspect-[4/5] overflow-hidden bg-muted">
          {image ? (
            <div data-parallax>
              <Image
                src={image.url}
                alt={property.title}
                fill
                priority={priority}
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className="object-cover transition-transform duration-[1600ms] ease-out group-hover:scale-[1.05]"
              />
            </div>
          ) : (
            <div className="flex h-full w-full items-center justify-center text-[11px] uppercase tracking-[0.24em] text-muted-foreground/60">
              Foto menyusul
            </div>
          )}
          <div
            aria-hidden
            className="absolute inset-0 bg-gradient-to-t from-[#140A04]/35 via-transparent to-[#140A04]/25"
          />
          <p className="absolute left-5 top-5 text-[10px] font-semibold uppercase tracking-[0.28em] text-white">
            {LISTING_TYPE_LABELS[property.listingType] ?? property.listingType}
            <span aria-hidden className="mx-2 text-white/50">/</span>
            {PROPERTY_TYPE_LABELS[property.type] ?? property.type}
          </p>
          <span
            aria-hidden
            className="absolute bottom-5 right-5 flex size-11 items-center justify-center bg-[#F3EDE4] text-foreground opacity-0 transition-all duration-500 group-hover:opacity-100 group-focus-within:opacity-100"
          >
            <ArrowUpRight size={18} strokeWidth={1.25} />
          </span>
        </div>

        <div className="pt-6">
          <p className="text-[10px] font-medium uppercase tracking-[0.28em] text-muted-foreground">
            {property.city}
          </p>
          <h3 className="mt-3 line-clamp-2 font-serif text-[26px] font-normal leading-[1.15] text-foreground transition-colors duration-300 group-hover:text-primary">
            {property.title}
          </h3>
        </div>
      </Link>

      <div className="mt-5 flex items-end justify-between gap-4 border-t border-border pt-4">
        <div className="min-w-0">
          <p className="flex items-baseline gap-1 text-[17px] font-medium text-foreground">
            <span className="text-[11px] text-muted-foreground">{price.prefix}</span>
            {price.value}
            {price.suffix && <span className="text-[11px] text-muted-foreground">{price.suffix}</span>}
          </p>
          {specs && <p className="mt-1 truncate text-[12px] text-muted-foreground">{specs}</p>}
        </div>
        {whatsappHref && (
          <a
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Tanya lewat WhatsApp: ${property.title}`}
            className="shrink-0 border-b border-foreground/30 pb-1 text-[10px] font-semibold uppercase tracking-[0.24em] text-foreground transition-colors hover:border-primary hover:text-primary"
          >
            WhatsApp
          </a>
        )}
      </div>

      <div className="absolute right-4 top-4 z-10">
        <FavoriteButton propertyId={property.id} initialFavorited={initialFavorited} />
      </div>
    </article>
  )
}
