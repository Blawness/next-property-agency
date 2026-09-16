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
function safePriceLabel(price: string, listingType: string, suffixPerType: string): string {
  const num = Number.parseInt(price, 10)
  if (!Number.isFinite(num) || num < 0) return "—"
  const body =
    num >= 1_000_000_000
      ? `${(num / 1_000_000_000).toFixed(1)} M`
      : num >= 1_000_000
        ? `${(num / 1_000_000).toFixed(0)} Jt`
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
      ? `${(num / 1_000_000_000).toFixed(1)} M`
      : num >= 1_000_000
        ? `${(num / 1_000_000).toFixed(0)} Jt`
        : num.toLocaleString("id-ID")
  return { prefix: "Rp", value, suffix: listingType === "sewa" ? "/bln" : "" }
}

export function formatPriceFull(price: string, listingType: string): string {
  const num = Number.parseInt(price, 10)
  if (!Number.isFinite(num) || num < 0) return "—"
  const base =
    num >= 1_000_000_000
      ? `Rp ${(num / 1_000_000_000).toFixed(2)} Miliar`
      : num >= 1_000_000
        ? `Rp ${(num / 1_000_000).toFixed(0)} Juta`
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
