import { db } from "@/db"
import { properties } from "@/db/schema"
import { eq, asc, desc, and, gte, lte, ilike, or, isNull, count } from "drizzle-orm"
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
import {
  PROPERTY_TYPES,
  LISTING_TYPES,
  isSortKey,
  escapeLikePattern,
  parseMinBedrooms,
  type SortKey,
} from "@/lib/constants"
import { SlidersHorizontal, SearchX } from "lucide-react"
import SectionHeading from "@/components/SectionHeading"
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
  }>
}

const PAGE_SIZE = 24

const ORDER_BY: Record<SortKey, ReturnType<typeof desc>> = {
  terbaru: desc(properties.createdAt),
  termurah: asc(properties.price),
  termahal: desc(properties.price),
}

async function getProperties(
  filters: Awaited<PageProps["searchParams"]>,
): Promise<{ items: PropertyWithImages[]; total: number; page: number }> {
  const conditions = [eq(properties.status, "active"), isNull(properties.deletedAt)]

  if (filters.type && PROPERTY_TYPES.includes(filters.type as typeof PROPERTY_TYPES[number])) {
    conditions.push(eq(properties.type, filters.type as typeof PROPERTY_TYPES[number]))
  }
  if (filters.listingType && LISTING_TYPES.includes(filters.listingType as typeof LISTING_TYPES[number])) {
    conditions.push(eq(properties.listingType, filters.listingType as typeof LISTING_TYPES[number]))
  }
  if (filters.city) {
    conditions.push(ilike(properties.city, `%${filters.city}%`))
  }
  if (filters.minPrice) {
    conditions.push(gte(properties.price, filters.minPrice))
  }
  if (filters.maxPrice) {
    conditions.push(lte(properties.price, filters.maxPrice))
  }

  const minBedrooms = parseMinBedrooms(filters.minBedrooms)
  if (minBedrooms !== null) {
    conditions.push(gte(properties.bedrooms, minBedrooms))
  }

  const term = filters.q?.trim()
  if (term) {
    const pattern = `%${escapeLikePattern(term)}%`
    conditions.push(
      or(
        ilike(properties.title, pattern),
        ilike(properties.city, pattern),
        ilike(properties.address, pattern),
      )!,
    )
  }

  const page = Math.max(1, parseInt(filters.page ?? "1", 10) || 1)
  const orderBy = ORDER_BY[isSortKey(filters.sort) ? filters.sort : "terbaru"]

  const [items, totalRow] = await Promise.all([
    getPropertiesWithImagesBatch(
      db
        .select()
        .from(properties)
        .where(and(...conditions))
        .orderBy(orderBy)
        .limit(PAGE_SIZE)
        .offset((page - 1) * PAGE_SIZE),
    ),
    db.select({ n: count() }).from(properties).where(and(...conditions)),
  ])

  return { items, total: totalRow[0]?.n ?? 0, page }
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

async function PropertyGrid({ filters }: { filters: Awaited<PageProps["searchParams"]> }) {
  const [{ items, total, page }, session] = await Promise.all([
    getProperties(filters),
    getServerSession(authOptions),
  ])
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

  const totalPages = Math.ceil(total / PAGE_SIZE)
  const start = (page - 1) * PAGE_SIZE + 1
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
      <CatalogPagination page={page} totalPages={totalPages} filters={filters} />
    </div>
  )
}

export default async function PropertiPage({ searchParams }: PageProps) {
  const filters = await searchParams

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
          <Suspense fallback={<PropertyGridSkeleton />}>
            <PropertyGrid filters={filters} />
          </Suspense>
        </div>
      </div>
    </div>
  )
}
