import type { RawCatalogParams } from "@/lib/catalog-query"

/**
 * A price band on the homepage's "Cari sesuai budgetmu" rail. Sale listings
 * only: a monthly rent and a purchase price do not share a scale.
 *
 * `catalogConditions` applies both bounds inclusively (gte / lte), so each
 * upper bound stops one rupiah short of the next band's lower bound — a listing
 * at exactly Rp 500 jt belongs to one band, not two.
 */
export interface BudgetRange {
  id: string
  label: string
  /** Whole rupiah, inclusive. */
  min?: number
  /** Whole rupiah, inclusive. */
  max?: number
}

const JUTA = 1_000_000
const MILIAR = 1_000_000_000

export const BUDGET_RANGES: readonly BudgetRange[] = [
  { id: "lt-500jt", label: "< Rp 500 jt", max: 500 * JUTA - 1 },
  { id: "500jt-1m", label: "Rp 500 jt – 1 M", min: 500 * JUTA, max: 1 * MILIAR - 1 },
  { id: "1m-3m", label: "Rp 1 – 3 M", min: 1 * MILIAR, max: 3 * MILIAR - 1 },
  { id: "gt-3m", label: "> Rp 3 M", min: 3 * MILIAR },
]

/** The catalog filter for a band, in the same shape the URL carries. */
export function budgetParams(range: BudgetRange): RawCatalogParams {
  const raw: RawCatalogParams = { listingType: "jual" }
  if (range.min !== undefined) raw.minPrice = String(range.min)
  if (range.max !== undefined) raw.maxPrice = String(range.max)
  return raw
}

/** The catalog page for a band. */
export function budgetHref(range: BudgetRange): string {
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(budgetParams(range))) {
    if (value) params.set(key, value)
  }
  return `/properti?${params.toString()}`
}
