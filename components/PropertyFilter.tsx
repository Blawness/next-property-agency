"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { SlidersHorizontal, X, Search } from "lucide-react"
import {
  CITIES,
  PROPERTY_TYPES,
  PROPERTY_TYPE_LABELS,
  LISTING_TYPE_LABELS,
  SORT_KEYS,
  SORT_LABELS,
} from "@/lib/constants"
import { cn } from "@/lib/utils"

/** The price fields are typed in millions; the URL carries whole rupiah. */
const RUPIAH_PER_JUTA = 1_000_000

/** Whole rupiah from the URL, shown back in the "(Juta)" field it came from. */
export function rupiahToJuta(rupiah: string | null): string {
  if (!rupiah) return ""
  const n = Number(rupiah)
  return Number.isFinite(n) ? String(n / RUPIAH_PER_JUTA) : ""
}

/** What the visitor typed in millions, as whole rupiah — or "" for no bound. */
export function jutaToRupiah(juta: string): string {
  const n = Number(juta.trim())
  if (!juta.trim() || !Number.isFinite(n) || n < 0) return ""
  return String(Math.round(n * RUPIAH_PER_JUTA))
}

// Neither is a filter: `view` is how results are shown, `page` where in them.
const NOT_FILTERS = new Set(["view", "page"])

const LABEL = "mb-1 block text-xs font-medium text-muted-foreground"
const CONTROL = "h-9 text-sm rounded-full bg-background border border-border focus:ring-2 focus:ring-primary"

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        "inline-flex h-9 shrink-0 items-center rounded-full border px-4 text-[13px] font-medium transition-colors",
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-background text-foreground/75 hover:border-primary hover:text-primary",
      )}
    >
      {children}
    </button>
  )
}

/**
 * The catalog filter. `stack` is the vertical form in the mobile drawer; `bar`
 * is the horizontal bar above the desktop grid, with type and jual/sewa as
 * chips. Both write the same URL keys, which `parseCatalogFilters` reads.
 */
export default function PropertyFilter({ layout = "stack" }: { layout?: "stack" | "bar" }) {
  const router = useRouter()
  const searchParams = useSearchParams()

  function updateFilter(key: string, value: string) {
    const next = value && value !== "semua" ? value : ""
    // Blurring a field without editing it must not navigate: that would throw
    // the visitor back to page one for nothing.
    if (next === (searchParams.get(key) ?? "")) return

    const params = new URLSearchParams(searchParams.toString())
    if (next) {
      params.set(key, next)
    } else {
      params.delete(key)
    }
    params.delete("page")
    router.push(`/properti?${params.toString()}`)
  }

  function clearFilters() {
    // Keep the map open if that is where the visitor was.
    const view = searchParams.get("view")
    router.push(view ? `/properti?view=${encodeURIComponent(view)}` : "/properti")
  }

  const hasFilters = Array.from(searchParams.keys()).some((k) => !NOT_FILTERS.has(k))

  // The text and price fields are uncontrolled, so they would keep showing a
  // value after Reset or Back removed it from the URL. Keying them on the
  // param remounts them whenever it changes underneath.
  const q = searchParams.get("q") ?? ""
  const minPrice = searchParams.get("minPrice")
  const maxPrice = searchParams.get("maxPrice")
  const type = searchParams.get("type") ?? ""
  const listingType = searchParams.get("listingType") ?? ""

  const searchField = (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        const input = e.currentTarget.elements.namedItem("q") as HTMLInputElement
        updateFilter("q", input.value.trim())
      }}
    >
      <Label htmlFor={`q-${layout}`} className={LABEL}>
        Cari
      </Label>
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
        <Input
          key={q}
          id={`q-${layout}`}
          name="q"
          type="search"
          placeholder="Judul, kota, alamat..."
          className={`${CONTROL} pl-9`}
          defaultValue={q}
          onBlur={(e) => updateFilter("q", e.target.value.trim())}
        />
      </div>
    </form>
  )

  const sortField = (
    <div>
      <Label className={LABEL}>Urutkan</Label>
      <Select
        value={searchParams.get("sort") ?? "terbaru"}
        onValueChange={(v) => updateFilter("sort", v === "terbaru" ? "" : v)}
      >
        <SelectTrigger className={CONTROL}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {SORT_KEYS.map((k) => (
            <SelectItem key={k} value={k}>{SORT_LABELS[k]}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )

  const typeField = (
    <div>
      <Label className={LABEL}>Tipe Properti</Label>
      <Select value={type || "semua"} onValueChange={(v) => updateFilter("type", v)}>
        <SelectTrigger className={CONTROL}>
          <SelectValue placeholder="Semua Tipe" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="semua">Semua Tipe</SelectItem>
          {PROPERTY_TYPES.map((t) => (
            <SelectItem key={t} value={t}>{PROPERTY_TYPE_LABELS[t]}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )

  const listingField = (
    <div>
      <Label className={LABEL}>Jual / Sewa</Label>
      <Select value={listingType || "semua"} onValueChange={(v) => updateFilter("listingType", v)}>
        <SelectTrigger className={CONTROL}>
          <SelectValue placeholder="Semua" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="semua">Semua</SelectItem>
          {Object.entries(LISTING_TYPE_LABELS).map(([k, v]) => (
            <SelectItem key={k} value={k}>{v}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )

  const cityField = (
    <div>
      <Label className={LABEL}>Kota</Label>
      <Select
        value={searchParams.get("city") ?? "semua"}
        onValueChange={(v) => updateFilter("city", v)}
      >
        <SelectTrigger className={CONTROL}>
          <SelectValue placeholder="Semua Kota" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="semua">Semua Kota</SelectItem>
          {CITIES.map((city) => (
            <SelectItem key={city} value={city}>{city}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )

  const minPriceField = (
    <div>
      <Label className={LABEL}>Harga Min (Juta)</Label>
      <Input
        key={minPrice ?? ""}
        type="number"
        min={0}
        placeholder="Contoh: 500"
        className={CONTROL}
        defaultValue={rupiahToJuta(minPrice)}
        onBlur={(e) => updateFilter("minPrice", jutaToRupiah(e.target.value))}
      />
    </div>
  )

  const maxPriceField = (
    <div>
      <Label className={LABEL}>Harga Max (Juta)</Label>
      <Input
        key={maxPrice ?? ""}
        type="number"
        min={0}
        placeholder="Contoh: 2000"
        className={CONTROL}
        defaultValue={rupiahToJuta(maxPrice)}
        onBlur={(e) => updateFilter("maxPrice", jutaToRupiah(e.target.value))}
      />
    </div>
  )

  const bedroomsField = (
    <div>
      <Label className={LABEL}>Min Kamar Tidur</Label>
      <Select
        value={searchParams.get("minBedrooms") ?? "semua"}
        onValueChange={(v) => updateFilter("minBedrooms", v)}
      >
        <SelectTrigger className={CONTROL}>
          <SelectValue placeholder="Semua" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="semua">Semua</SelectItem>
          <SelectItem value="1">1+</SelectItem>
          <SelectItem value="2">2+</SelectItem>
          <SelectItem value="3">3+</SelectItem>
          <SelectItem value="4">4+</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )

  if (layout === "bar") {
    return (
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          {PROPERTY_TYPES.map((t) => (
            <FilterChip key={t} active={type === t} onClick={() => updateFilter("type", type === t ? "" : t)}>
              {PROPERTY_TYPE_LABELS[t]}
            </FilterChip>
          ))}
          <span aria-hidden className="mx-1 h-6 w-px bg-border" />
          {Object.entries(LISTING_TYPE_LABELS).map(([k, v]) => (
            <FilterChip
              key={k}
              active={listingType === k}
              onClick={() => updateFilter("listingType", listingType === k ? "" : k)}
            >
              {v}
            </FilterChip>
          ))}
          {hasFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters} className="ml-auto">
              <X className="mr-1 h-3 w-3" />
              Reset
            </Button>
          )}
        </div>
        <div className="grid grid-cols-2 gap-2 md:grid-cols-3 xl:grid-cols-6">
          {searchField}
          {cityField}
          {minPriceField}
          {maxPriceField}
          {bedroomsField}
          {sortField}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <SlidersHorizontal className="h-3.5 w-3.5 text-primary" />
          Filter
        </h2>
        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters} className="h-7 text-xs">
            <X className="h-3 w-3 mr-1" />
            Reset
          </Button>
        )}
      </div>

      <div className="space-y-3">
        {searchField}
        {sortField}
        {typeField}
        {listingField}
        {cityField}
        {minPriceField}
        {maxPriceField}
        {bedroomsField}
      </div>
    </div>
  )
}
