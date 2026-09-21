/** Absolute origin for shareable links (WhatsApp enquiries, share sheets). */
export const SITE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3001"

export const PROPERTY_TYPES = ["rumah", "apartemen", "tanah", "ruko"] as const

export const PROPERTY_TYPE_LABELS: Record<string, string> = {
  rumah: "Rumah",
  apartemen: "Apartemen",
  tanah: "Tanah",
  ruko: "Ruko",
}

export const LISTING_TYPES = ["jual", "sewa"] as const

export const LISTING_TYPE_LABELS: Record<string, string> = {
  jual: "Dijual",
  sewa: "Disewa",
}

export const CITIES = [
  "Jakarta", "Surabaya", "Bandung", "Medan", "Semarang",
  "Makassar", "Palembang", "Tangerang", "Depok", "Bekasi",
  "Bogor", "Bali", "Yogyakarta",
]

// All formatters guard against unparseable / empty / non-finite input by
// rendering an em-dash placeholder. This prevents "Rp NaN" from ever reaching
// the public catalog if a row's price column is ever set to a non-numeric value
// (e.g. via a future API change, a manual DB edit, or a soft-delete path).
/**
 * Indonesian writes decimals with a comma and thousands with a period, while
 * the JS fixed-decimal helper always emits a dot — which in this locale reads
 * as a thousands separator, so "Rp 1.50 Miliar" could be taken for a far
 * larger number.
 *
 * `max` also carries the accuracy fix: millions used to round to whole, so
 * Rp 3.500.000 rendered as "Rp 4 Juta" and Rp 1.400.000 as "Rp 1 Juta" — the
 * exact range monthly rents sit in. A whole value still prints without a
 * decimal when `min` is 0.
 */
function idNumber(value: number, min: number, max: number): string {
  return value.toLocaleString("id-ID", {
    minimumFractionDigits: min,
    maximumFractionDigits: max,
  })
}

function safePriceLabel(price: string, listingType: string, suffixPerType: string): string {
  const num = Number.parseInt(price, 10)
  if (!Number.isFinite(num) || num < 0) return "—"
  const body =
    num >= 1_000_000_000
      ? `${idNumber(num / 1_000_000_000, 0, 1)} M`
      : num >= 1_000_000
        ? `${idNumber(num / 1_000_000, 0, 1)} Jt`
        : num.toLocaleString("id-ID")
  return `Rp ${body}${listingType === "sewa" ? suffixPerType : ""}`
}

export function formatPriceCompact(price: string, listingType: string): string {
  return safePriceLabel(price, listingType, "/bln")
}

export function formatPriceCompactValue(price: string, listingType: string): {
  prefix: string
  value: string
  suffix: string
} {
  const num = Number.parseInt(price, 10)
  if (!Number.isFinite(num) || num < 0) {
    return { prefix: "Rp", value: "—", suffix: "" }
  }
  const value =
    num >= 1_000_000_000
      ? `${idNumber(num / 1_000_000_000, 0, 1)} M`
      : num >= 1_000_000
        ? `${idNumber(num / 1_000_000, 0, 1)} Jt`
        : num.toLocaleString("id-ID")
  return { prefix: "Rp", value, suffix: listingType === "sewa" ? "/bln" : "" }
}

export function formatPriceFull(price: string, listingType: string): string {
  const num = Number.parseInt(price, 10)
  if (!Number.isFinite(num) || num < 0) return "—"
  const base =
    num >= 1_000_000_000
      ? `Rp ${idNumber(num / 1_000_000_000, 2, 2)} Miliar`
      : num >= 1_000_000
        ? `Rp ${idNumber(num / 1_000_000, 0, 1)} Juta`
        : `Rp ${num.toLocaleString("id-ID")}`
  return listingType === "sewa" ? `${base}/bulan` : base
}

export const SORT_KEYS = ["terbaru", "termurah", "termahal"] as const

export type SortKey = (typeof SORT_KEYS)[number]

export const SORT_LABELS: Record<SortKey, string> = {
  terbaru: "Terbaru",
  termurah: "Harga Terendah",
  termahal: "Harga Tertinggi",
}

export function isSortKey(v: string | undefined): v is SortKey {
  return !!v && (SORT_KEYS as readonly string[]).includes(v)
}

// `%` and `_` are LIKE wildcards. A raw search term containing them would widen
// the match instead of narrowing it (a lone "%" matches every row), so escape
// them along with the backslash escape character itself.
export function escapeLikePattern(term: string): string {
  return term.replace(/[\\%_]/g, (c) => `\\${c}`)
}

// The bedroom filter is a "N+" selector, so only positive integers are meaningful.
// Anything else (empty, "semua", garbage from a hand-edited URL) means "no filter".
export function parseMinBedrooms(raw: string | undefined): number | null {
  if (!raw) return null
  const n = Number.parseInt(raw, 10)
  return Number.isInteger(n) && n > 0 ? n : null
}
