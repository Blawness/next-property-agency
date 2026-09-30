import { properties } from "@/db/schema"
import { and, asc, desc, eq, gte, ilike, isNull, isNotNull, lte, or, type SQL } from "drizzle-orm"
import {
  PROPERTY_TYPES,
  LISTING_TYPES,
  isSortKey,
  escapeLikePattern,
  parseMinBedrooms,
  type SortKey,
} from "@/lib/constants"

export const CATALOG_PAGE_SIZE = 24

/**
 * Every marker is shipped to the browser, so the map query is capped. The list
 * is paginated and the map is not — showing only the current page's pins would
 * under-report what a search actually found.
 */
export const MAP_MARKER_LIMIT = 500

/**
 * Price alone ties whenever two listings cost the same, and `created_at` ties
 * for rows inserted together (a seed, a bulk import). Postgres orders ties
 * however it likes and may choose differently per query, so without the id as
 * a final key OFFSET pagination can show a listing on two pages and skip
 * another entirely.
 */
export const CATALOG_ORDER_BY: Record<SortKey, SQL[]> = {
  terbaru: [desc(properties.createdAt), desc(properties.id)],
  termurah: [asc(properties.price), desc(properties.id)],
  termahal: [desc(properties.price), desc(properties.id)],
}

/**
 * A price bound from the URL, as whole rupiah. The column is numeric, so a
 * hand-edited `?minPrice=abc` would reach Postgres as an invalid cast and take
 * the whole page down with it; anything that is not a non-negative whole
 * number is treated as no bound at all.
 */
export function parsePriceBound(raw: string | undefined): string | undefined {
  const trimmed = raw?.trim()
  if (!trimmed || !/^\d+$/.test(trimmed)) return undefined
  return trimmed.replace(/^0+(?=\d)/, "")
}

export const CATALOG_VIEWS = ["daftar", "peta"] as const
export type CatalogView = (typeof CATALOG_VIEWS)[number]

export function isCatalogView(value: string | undefined): value is CatalogView {
  return value !== undefined && (CATALOG_VIEWS as readonly string[]).includes(value)
}

/** Raw `searchParams`, straight off the URL and therefore untrusted. */
export interface RawCatalogParams {
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
}

export interface CatalogFilters {
  type?: (typeof PROPERTY_TYPES)[number]
  listingType?: (typeof LISTING_TYPES)[number]
  city?: string
  minPrice?: string
  maxPrice?: string
  minBedrooms: number | null
  q?: string
  sort: SortKey
  page: number
  view: CatalogView
}

/**
 * Normalises the URL into one validated shape. The list and the map both read
 * this, so a filter can never apply to one and not the other.
 */
export function parseCatalogFilters(raw: RawCatalogParams): CatalogFilters {
  const page = Number.parseInt(raw.page ?? "1", 10)
  const q = raw.q?.trim()

  return {
    type: PROPERTY_TYPES.includes(raw.type as (typeof PROPERTY_TYPES)[number])
      ? (raw.type as (typeof PROPERTY_TYPES)[number])
      : undefined,
    listingType: LISTING_TYPES.includes(raw.listingType as (typeof LISTING_TYPES)[number])
      ? (raw.listingType as (typeof LISTING_TYPES)[number])
      : undefined,
    city: raw.city?.trim() || undefined,
    minPrice: parsePriceBound(raw.minPrice),
    maxPrice: parsePriceBound(raw.maxPrice),
    minBedrooms: parseMinBedrooms(raw.minBedrooms),
    q: q ? q : undefined,
    sort: isSortKey(raw.sort) ? raw.sort : "terbaru",
    page: Number.isFinite(page) && page > 0 ? page : 1,
    view: isCatalogView(raw.view) ? raw.view : "daftar",
  }
}

/**
 * The public catalog's WHERE clause. `requireCoords` is the map's only
 * difference: a listing with no lat/lng cannot be drawn.
 */
export function catalogConditions(f: CatalogFilters, { requireCoords = false } = {}) {
  const conditions = [eq(properties.status, "active"), isNull(properties.deletedAt)]

  if (f.type) conditions.push(eq(properties.type, f.type))
  if (f.listingType) conditions.push(eq(properties.listingType, f.listingType))
  if (f.city) conditions.push(ilike(properties.city, `%${escapeLikePattern(f.city)}%`))
  if (f.minPrice) conditions.push(gte(properties.price, f.minPrice))
  if (f.maxPrice) conditions.push(lte(properties.price, f.maxPrice))
  if (f.minBedrooms !== null) conditions.push(gte(properties.bedrooms, f.minBedrooms))

  if (f.q) {
    const pattern = `%${escapeLikePattern(f.q)}%`
    conditions.push(
      or(
        ilike(properties.title, pattern),
        ilike(properties.city, pattern),
        ilike(properties.address, pattern),
      )!,
    )
  }

  if (requireCoords) {
    conditions.push(isNotNull(properties.lat), isNotNull(properties.lng))
  }

  return and(...conditions)
}
