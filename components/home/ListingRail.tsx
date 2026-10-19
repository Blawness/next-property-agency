import Link from "next/link"
import { ArrowRight } from "lucide-react"
import PropertyCard from "@/components/PropertyCard"
import { Button } from "@/components/ui/button"
import Rail from "@/components/home/Rail"
import type { PropertyWithImages } from "@/lib/types"
import { cn } from "@/lib/utils"

export interface RailChip {
  label: string
  href: string
  /** Drawn filled — the band a rail is showing. Visual only: these are links. */
  active?: boolean
}

interface ListingRailProps {
  heading: string
  subheading?: string
  chips: readonly RailChip[]
  properties: PropertyWithImages[]
  favoriteIds: ReadonlySet<string>
  seeAllHref: string
  className?: string
}

/** A homepage section: heading, a row of filter chips, and a scrolling row of listings. */
export default function ListingRail({
  heading,
  subheading,
  chips,
  properties,
  favoriteIds,
  seeAllHref,
  className,
}: ListingRailProps) {
  return (
    <section className={cn("container mx-auto px-4 py-10 sm:py-12", className)}>
      <div className="mb-4 flex items-end justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-accent sm:text-2xl">{heading}</h2>
          {subheading && <p className="mt-1 text-sm text-muted-foreground">{subheading}</p>}
        </div>
        <Link
          href={seeAllHref}
          className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-primary hover:underline"
        >
          Lihat Semua
          <ArrowRight size={15} aria-hidden />
        </Link>
      </div>

      <div className="-mx-4 mb-5 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {chips.map((chip) => (
          <Button
            key={chip.href}
            asChild
            variant={chip.active ? "default" : "outline"}
            className="h-9 shrink-0 px-4 text-[13px]"
          >
            <Link href={chip.href} prefetch={false}>
              {chip.label}
            </Link>
          </Button>
        ))}
      </div>

      {properties.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border py-12 text-center text-sm text-muted-foreground">
          Belum ada listing aktif saat ini.
        </p>
      ) : (
        <Rail label={heading}>
          {properties.map((property) => (
            <PropertyCard
              key={property.id}
              property={property}
              variant="rail"
              initialFavorited={favoriteIds.has(property.id)}
            />
          ))}
        </Rail>
      )}
    </section>
  )
}
