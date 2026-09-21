import { db } from "@/db"
import { properties } from "@/db/schema"
import { asc, desc, count } from "drizzle-orm"
import PropertyCard from "@/components/PropertyCard"
import PropertyFilter from "@/components/PropertyFilter"
import CatalogPagination from "@/components/CatalogPagination"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Suspense } from "react"
import Link from "next/link"
import type { PropertyWithImages } from "@/lib/types"
import { getPropertiesWithImagesBatch, getFavoritePropertyIds } from "@/lib/db-helpers"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { type SortKey } from "@/lib/constants"
import {
  parseCatalogFilters,
  catalogConditions,
  CATALOG_PAGE_SIZE,
  MAP_MARKER_LIMIT,
  type CatalogFilters,
  type RawCatalogParams,
} from "@/lib/catalog-query"
import { SlidersHorizontal, SearchX } from "lucide-react"
import SectionHeading from "@/components/SectionHeading"
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

const ORDER_BY: Record<SortKey, ReturnType<typeof desc>> = {
  terbaru: desc(properties.createdAt),
  termurah: asc(properties.price),
  termahal: desc(properties.price),
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
        .orderBy(ORDER_BY[filters.sort])
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
        .orderBy(ORDER_BY[filters.sort])
        .limit(MAP_MARKER_LIMIT),
    ),
    db.select({ n: count() }).from(properties).where(catalogConditions(filters)),
  ])

  return { pins, matching: totalRow[0]?.n ?? 0 }
}

const SKELETON_CARDS = Array.from({ length: 6 })

function PropertyGridSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
      {SKELETON_CARDS.map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="h-48 w-full rounded-lg" />
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
        <Button variant="outline" size="sm" className="mt-5 rounded-xl" asChild>
          <Link href="/properti">Reset Filter</Link>
        </Button>
      </div>
    )
  }

  const totalPages = Math.ceil(total / CATALOG_PAGE_SIZE)
  const start = (page - 1) * CATALOG_PAGE_SIZE + 1
  const end = start + items.length - 1

  return (
    <div>
      <p className="mb-5 text-sm text-muted-foreground">
        Menampilkan <span className="font-semibold italic text-primary">{start}–{end}</span> dari{" "}
        <span className="font-semibold italic text-primary">{total}</span> properti
      </p>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((property, i) => (
          <Reveal key={property.id} delay={(i % 3) * 90}>
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
      <div className="flex h-[60vh] min-h-[420px] flex-col items-center justify-center gap-3 rounded-sm border border-border text-center">
        <SearchX size={28} strokeWidth={1.5} className="text-primary" />
        <p className="font-sans text-lg font-semibold text-foreground">
          Tidak ada properti ditemukan
        </p>
        <Button variant="outline" size="sm" className="rounded-sm" asChild>
          <Link href="/properti?view=peta">Reset Filter</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <MapCoverageNotice pinned={pins.length} matching={matching} />
      <div className="overflow-hidden rounded-sm border border-border">
        <div className="h-[60vh] min-h-[420px]">
          <MapView properties={pins} />
        </div>
      </div>
    </div>
  )
}

function MapSkeleton() {
  return <Skeleton className="h-[60vh] min-h-[420px] w-full rounded-sm" />
}

export default async function PropertiPage({ searchParams }: PageProps) {
  const raw = await searchParams
  const filters = parseCatalogFilters(raw)

  return (
    <div className="container mx-auto px-4 py-8">
      <SectionHeading eyebrow="Katalog" title="Katalog Properti" />

      {/* Mobile filter drawer */}
      <div className="lg:hidden mb-4">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="sm" className="rounded-xl">
              <SlidersHorizontal size={14} className="mr-1" /> Filter
            </Button>
          </SheetTrigger>
          <SheetContent side="left">
            <SheetHeader>
              <SheetTitle>Filter Properti</SheetTitle>
            </SheetHeader>
            <div className="py-4">
              <Suspense>
                <PropertyFilter />
              </Suspense>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      <div className="flex gap-8">
        <aside className="hidden lg:block w-56 shrink-0">
          <div className="sticky top-20 rounded-3xl bg-secondary/60 p-6">
            <Suspense>
              <PropertyFilter />
            </Suspense>
          </div>
        </aside>
        <div className="flex-1 min-w-0">
          <div className="mb-5 flex justify-end">
            <CatalogViewToggle view={filters.view} filters={raw} />
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
      </div>
    </div>
  )
}
