import Link from "next/link"
import Image from "next/image"
import { MessageCircle } from "lucide-react"
import type { PropertyWithImages } from "@/lib/types"
import { formatPriceCompactValue, SITE_URL } from "@/lib/constants"
import { BRAND } from "@/lib/brand"
import { buildWhatsAppLink } from "@/lib/whatsapp"
import { cn } from "@/lib/utils"
import PropertyPills from "@/components/PropertyPills"
import FavoriteButton from "@/components/FavoriteButton"

type CardVariant = "grid" | "rail"

// The width each photo is drawn at. Grid: 1 / 2 / 3 / 4 columns at the catalog
// breakpoints. Rail: a fixed 260px card.
const SIZES: Record<CardVariant, string> = {
  grid: "(max-width: 639px) 100vw, (max-width: 1023px) 50vw, (max-width: 1279px) 33vw, 25vw",
  rail: "260px",
}

/** "3 KT · 2 KM · 120 m²", or "LT 200 m²" for land — null when there is nothing to show. */
export function specLine(
  p: Pick<PropertyWithImages, "type" | "bedrooms" | "bathrooms" | "buildingArea" | "landArea">,
): string | null {
  if (p.type === "tanah") return p.landArea != null ? `LT ${p.landArea} m²` : null
  const parts = [
    p.bedrooms != null ? `${p.bedrooms} KT` : null,
    p.bathrooms != null ? `${p.bathrooms} KM` : null,
    p.buildingArea != null ? `${p.buildingArea} m²` : null,
  ].filter(Boolean)
  return parts.length > 0 ? parts.join(" · ") : null
}

export default function PropertyCard({
  property,
  initialFavorited = false,
  variant = "grid",
}: {
  property: PropertyWithImages
  initialFavorited?: boolean
  variant?: CardVariant
}) {
  const primaryImage = property.images.find((i) => i.isPrimary) ?? property.images[0]
  const price = formatPriceCompactValue(property.price, property.listingType)
  const specs = specLine(property)

  const whatsappHref = buildWhatsAppLink({
    title: property.title,
    price: property.price,
    listingType: property.listingType,
    url: `${SITE_URL}/properti/${property.id}`,
    agentPhone: property.agentPhone,
    officePhone: BRAND.contact.whatsapp,
  })

  return (
    <article
      className={cn(
        "group relative overflow-hidden rounded-xl border border-border/70 bg-card shadow-sm transition-shadow duration-200 hover:shadow-lg",
        variant === "rail" && "w-[260px] shrink-0",
      )}
    >
      <Link
        href={`/properti/${property.id}`}
        prefetch={false}
        className="block outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
      >
        <div className="relative aspect-[4/3] bg-muted">
          {primaryImage ? (
            <Image
              src={primaryImage.url}
              alt={property.title}
              fill
              sizes={SIZES[variant]}
              className="object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-sm text-muted-foreground/60">
              Tidak ada foto
            </div>
          )}
          <div className="absolute left-2.5 top-2.5">
            <PropertyPills listingType={property.listingType} type={property.type} />
          </div>
        </div>

        <div className="p-3.5">
          <h3 className="line-clamp-2 min-h-[2.6rem] text-[15px] font-semibold leading-snug text-foreground">
            {property.title}
          </h3>
          <p className="mt-1 line-clamp-1 text-[13px] text-muted-foreground">
            {property.address ?? property.city}
          </p>
          {specs && <p className="mt-0.5 text-[13px] text-muted-foreground">{specs}</p>}
          {/* Right padding keeps the price clear of the WhatsApp button. */}
          <p className="mt-2.5 flex items-baseline gap-0.5 pr-11 text-lg font-bold leading-none text-primary">
            <span className="text-[0.7em] font-semibold">{price.prefix}</span>
            <span>{price.value}</span>
            {price.suffix && <span className="text-[0.7em] font-medium">{price.suffix}</span>}
          </p>
        </div>
      </Link>

      <div className="absolute right-2.5 top-2.5">
        <FavoriteButton propertyId={property.id} initialFavorited={initialFavorited} />
      </div>

      {whatsappHref && (
        <a
          href={whatsappHref}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Tanya lewat WhatsApp: ${property.title}`}
          className="absolute bottom-3 right-3 flex h-9 w-9 items-center justify-center rounded-full bg-accent text-accent-foreground transition-colors hover:bg-primary"
        >
          <MessageCircle size={16} aria-hidden />
        </a>
      )}
    </article>
  )
}
