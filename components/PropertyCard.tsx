import Link from "next/link"
import Image from "next/image"
import { MapPin, BedDouble, Bath, Maximize2 } from "lucide-react"
import type { PropertyWithImages } from "@/lib/types"
import { formatPriceCompactValue } from "@/lib/constants"
import PropertyPills from "@/components/PropertyPills"
import FavoriteButton from "@/components/FavoriteButton"

export default function PropertyCard({
  property,
  initialFavorited = false,
}: {
  property: PropertyWithImages
  initialFavorited?: boolean
}) {
  const primaryImage = property.images.find((i) => i.isPrimary) ?? property.images[0]

  const hasSpecs =
    property.type === "tanah"
      ? property.landArea != null
      : property.bedrooms != null || property.bathrooms != null || property.buildingArea != null

  const price = formatPriceCompactValue(property.price, property.listingType)

  return (
    <Link
      href={`/properti/${property.id}`}
      className="group relative block overflow-hidden rounded-2xl border border-border bg-card transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
    >
      {/* Gold hairline on hover */}
      <div
        aria-hidden
        className="absolute inset-x-6 top-0 z-10 h-px origin-center scale-x-0 bg-gradient-to-r from-transparent via-gold to-transparent transition-transform duration-500 group-hover:scale-x-100"
      />

      <div className="relative h-56 overflow-hidden bg-muted">
        {primaryImage ? (
          <Image
            src={primaryImage.url}
            alt={property.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-sm text-muted-foreground/40">
            Tidak ada foto
          </div>
        )}

        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/45 via-black/10 to-transparent" />

        <div className="absolute left-3 top-3">
          <PropertyPills listingType={property.listingType} type={property.type} />
        </div>

        <div className="absolute right-3 top-3">
          <FavoriteButton propertyId={property.id} initialFavorited={initialFavorited} />
        </div>
      </div>

      <div className="p-5">
        <p className="mb-1.5 flex items-baseline gap-0.5 font-sans text-[22px] font-semibold leading-tight text-primary">
          <span className="text-[0.55em] font-medium text-primary/80">{price.prefix}</span>
          <span>{price.value}</span>
          {price.suffix && (
            <span className="ml-0.5 self-end text-[0.55em] font-medium text-primary/80">
              {price.suffix}
            </span>
          )}
        </p>

        <h3 className="mb-2 line-clamp-1 font-sans text-[16px] font-medium leading-snug text-foreground transition-colors duration-200 group-hover:text-primary">
          {property.title}
        </h3>

        <div className="flex items-center gap-1.5 text-[12px] text-muted-foreground">
          <MapPin size={11} className="shrink-0 text-primary" />
          <span className="line-clamp-1">{property.address ?? property.city}</span>
        </div>

        {hasSpecs && (
          <div className="mt-3.5 flex items-center gap-3 border-t border-border/60 pt-3 text-[12px] text-muted-foreground">
            {property.type === "tanah" ? (
              <span className="flex items-center gap-1.5">
                <Maximize2 size={11} className="text-primary/70" />
                {property.landArea} m²
              </span>
            ) : (
              <>
                {property.bedrooms != null && (
                  <span className="flex items-center gap-1.5">
                    <BedDouble size={11} className="text-primary/70" />
                    {property.bedrooms} KT
                  </span>
                )}
                {property.bedrooms != null && property.bathrooms != null && (
                  <span aria-hidden className="h-3 w-px bg-border" />
                )}
                {property.bathrooms != null && (
                  <span className="flex items-center gap-1.5">
                    <Bath size={11} className="text-primary/70" />
                    {property.bathrooms} KM
                  </span>
                )}
                {property.buildingArea != null && property.bathrooms != null && (
                  <span aria-hidden className="h-3 w-px bg-border" />
                )}
                {property.buildingArea != null && (
                  <span className="flex items-center gap-1.5">
                    <Maximize2 size={11} className="text-primary/70" />
                    {property.buildingArea} m²
                  </span>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </Link>
  )
}
