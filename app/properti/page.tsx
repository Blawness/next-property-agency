import { db } from "@/db"
import { properties } from "@/db/schema"
import { count } from "drizzle-orm"
import PropertyCard from "@/components/PropertyCard"
import PropertyFilter from "@/components/PropertyFilter"
import CatalogPagination, { catalogPageHref } from "@/components/CatalogPagination"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import CatalogFilterSheet from "@/components/CatalogFilterSheet"
import { Suspense } from "react"
import Link from "next/link"
import type { PropertyWithImages } from "@/lib/types"
import { getPropertiesWithImagesBatch, getFavoritePropertyIds } from "@/lib/db-helpers"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import {
  parseCatalogFilters,
  catalogConditions,
  CATALOG_ORDER_BY,
  CATALOG_PAGE_SIZE,
  MAP_MARKER_LIMIT,
  type CatalogFilters,
  type RawCatalogParams,
} from "@/lib/catalog-query"
import { SearchX } from "lucide-react"
import SectionHeading from "@/components/SectionHeading"
import { BRAND } from "@/lib/brand"
import CatalogViewToggle from "@/components/CatalogViewToggle"
import MapView from "@/components/MapView"
import MapCoverageNotice from "@/components/MapCoverageNotice"
import Reveal from "@/components/Reveal"

export const revalidate = 60

interface PageProps {
  searchParams: Promise<{
    type?: string
    listingType?: string
    city?: string
    minPrice?: string
    maxPrice?: string
    minBedrooms?: string
    q?: string
    sort?: string
    page?: string
    view?: string
  }>
}

async function getProperties(
  filters: CatalogFilters,
): Promise<{ items: PropertyWithImages[]; total: number }> {
  const where = catalogConditions(filters)

  const [items, totalRow] = await Promise.all([
    getPropertiesWithImagesBatch(
      db
        .select()
        .from(properties)
        .where(where)
        .orderBy(...CATALOG_ORDER_BY[filters.sort])
        .limit(CATALOG_PAGE_SIZE)
        .offset((filters.page - 1) * CATALOG_PAGE_SIZE),
    ),
    db.select({ n: count() }).from(properties).where(where),
  ])

  return { items, total: totalRow[0]?.n ?? 0 }
}

/**
 * Pins for the map. Same filters as the list, but deliberately not paginated —
 * drawing only page one would under-report what the search found. Capped
 * instead, since every marker is shipped to the browser.
 */
async function getMapPins(filters: CatalogFilters) {
  const [pins, totalRow] = await Promise.all([
    getPropertiesWithImagesBatch(
      db
        .select()
        .from(properties)
        .where(catalogConditions(filters, { requireCoords: true }))
        .orderBy(...CATALOG_ORDER_BY[filters.sort])
        .limit(MAP_MARKER_LIMIT),
    ),
    db.select({ n: count() }).from(properties).where(catalogConditions(filters)),
  ])

  return { pins, matching: totalRow[0]?.n ?? 0 }
}

const SKELETON_CARDS = Array.from({ length: 8 })

function PropertyGridSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {SKELETON_CARDS.map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="aspect-[4/3] w-full rounded-xl" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-32" />
        </div>
      ))}
    </div>
  )
}

async function PropertyGrid({
  filters,
  raw,
}: {
  filters: CatalogFilters
  raw: RawCatalogParams
}) {
  const [{ items, total }, session] = await Promise.all([
    getProperties(filters),
    getServerSession(authOptions),
  ])
  const page = filters.page
  const favoriteIds = session?.user?.id ? await getFavoritePropertyIds(session.user.id) : new Set<string>()
  const totalPages = Math.ceil(total / CATALOG_PAGE_SIZE)

  // Matches exist, just not on this page — an old bookmark, or a last page
  // that emptied as listings sold. "Nothing found" would be untrue here.
  if (items.length === 0 && total > 0) {
    return (
      <div className="text-center py-20">
        <p className="font-sans text-lg font-semibold text-foreground">
          Halaman {page} tidak tersedia
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          Pencarian ini hanya punya {totalPages} halaman ({total} properti).
        </p>
        <Button variant="outline" size="sm" className="mt-5" asChild>
          <Link href={catalogPageHref(raw, 1)}>Ke Halaman Pertama</Link>
        </Button>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border-2 border-primary text-primary">
          <SearchX size={28} strokeWidth={1.5} />
        </div>
        <p className="mt-4 font-sans text-lg font-semibold text-foreground">
          Tidak ada properti ditemukan
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          Coba ubah atau hapus beberapa filter.
        </p>
        <Button variant="outline" size="sm" className="mt-5" asChild>
          <Link href="/properti">Reset Filter</Link>
        </Button>
      </div>
    )
  }

  const start = (page - 1) * CATALOG_PAGE_SIZE + 1
  const end = start + items.length - 1

  return (
    <div>
      <p className="mb-5 text-sm text-muted-foreground">
        <span className="font-semibold text-foreground">{total} properti</span> ditemukan
        <span className="text-muted-foreground/70"> · menampilkan {start}–{end}</span>
      </p>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {items.map((property, i) => (
          <Reveal key={property.id} delay={(i % 4) * 90}>
            <PropertyCard property={property} initialFavorited={favoriteIds.has(property.id)} />
          </Reveal>
        ))}
      </div>
      <CatalogPagination page={page} totalPages={totalPages} filters={raw} />
    </div>
  )
}

async function PropertyMapPanel({ filters }: { filters: CatalogFilters }) {
  const { pins, matching } = await getMapPins(filters)

  if (matching === 0) {
    return (
      <div className="flex h-[60vh] min-h-[420px] flex-col items-center justify-center gap-3 rounded-xl border border-border text-center">
        <SearchX size={28} strokeWidth={1.5} className="text-primary" />
        <p className="font-sans text-lg font-semibold text-foreground">
          Tidak ada properti ditemukan
        </p>
        <Button variant="outline" size="sm" asChild>
          <Link href="/properti?view=peta">Reset Filter</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <MapCoverageNotice pinned={pins.length} matching={matching} />
      <div className="overflow-hidden rounded-xl border border-border">
        <div className="h-[60vh] min-h-[420px]">
          <MapView properties={pins} />
        </div>
      </div>
    </div>
  )
}

function MapSkeleton() {
  return <Skeleton className="h-[60vh] min-h-[420px] w-full rounded-xl" />
}

export default async function PropertiPage({ searchParams }: PageProps) {
  const raw = await searchParams
  const filters = parseCatalogFilters(raw)

  return (
    <div className="container mx-auto px-4 py-8">
      <SectionHeading title={BRAND.pageTitle.catalogHeading} />

      {/* Desktop filter bar. It stays under the navbar only from xl, where the
          fields fit one row (~130px); below that it wraps to ~190px, a quarter
          of a laptop screen, so it scrolls away with the page instead. */}
      <div className="top-16 z-30 -mx-4 mb-6 hidden border-b border-border bg-background px-4 py-3 lg:block xl:sticky">
        <Suspense>
          <PropertyFilter layout="bar" />
        </Suspense>
      </div>

      <div className="mb-5 flex items-center justify-between gap-3">
        <div className="lg:hidden">
          <CatalogFilterSheet />
        </div>
        <div className="ml-auto">
          <CatalogViewToggle view={filters.view} filters={raw} />
        </div>
      </div>

      {filters.view === "peta" ? (
        <Suspense fallback={<MapSkeleton />}>
          <PropertyMapPanel filters={filters} />
        </Suspense>
      ) : (
        <Suspense fallback={<PropertyGridSkeleton />}>
          <PropertyGrid filters={filters} raw={raw} />
        </Suspense>
      )}
    </div>
  )
}
