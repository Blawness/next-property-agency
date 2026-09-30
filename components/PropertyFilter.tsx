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

export default function PropertyFilter() {
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

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="font-sans font-semibold text-[11px] uppercase tracking-[0.18em] text-foreground flex items-center gap-2">
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
        <form
          onSubmit={(e) => {
            e.preventDefault()
            const input = e.currentTarget.elements.namedItem("q") as HTMLInputElement
            updateFilter("q", input.value.trim())
          }}
        >
          <Label
            htmlFor="q"
            className="text-[11px] font-medium uppercase tracking-[0.16em] text-foreground/70 mb-1 block"
          >
            Cari
          </Label>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              key={q}
              id="q"
              name="q"
              type="search"
              placeholder="Judul, kota, alamat..."
              className="h-9 pl-9 text-sm rounded-xl bg-background border border-border focus:ring-2 focus:ring-primary"
              defaultValue={q}
              onBlur={(e) => updateFilter("q", e.target.value.trim())}
            />
          </div>
        </form>

        <div>
          <Label className="text-[11px] font-medium uppercase tracking-[0.16em] text-foreground/70 mb-1 block">Urutkan</Label>
          <Select
            value={searchParams.get("sort") ?? "terbaru"}
            onValueChange={(v) => updateFilter("sort", v === "terbaru" ? "" : v)}
          >
            <SelectTrigger className="h-9 text-sm rounded-xl bg-background border border-border focus:ring-2 focus:ring-primary">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SORT_KEYS.map((k) => (
                <SelectItem key={k} value={k}>{SORT_LABELS[k]}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-[11px] font-medium uppercase tracking-[0.16em] text-foreground/70 mb-1 block">Tipe Properti</Label>
          <Select
            value={searchParams.get("type") ?? "semua"}
            onValueChange={(v) => updateFilter("type", v)}
          >
            <SelectTrigger className="h-9 text-sm rounded-xl bg-background border border-border focus:ring-2 focus:ring-primary">
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

        <div>
          <Label className="text-[11px] font-medium uppercase tracking-[0.16em] text-foreground/70 mb-1 block">Jual / Sewa</Label>
          <Select
            value={searchParams.get("listingType") ?? "semua"}
            onValueChange={(v) => updateFilter("listingType", v)}
          >
            <SelectTrigger className="h-9 text-sm rounded-xl bg-background border border-border focus:ring-2 focus:ring-primary">
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

        <div>
          <Label className="text-[11px] font-medium uppercase tracking-[0.16em] text-foreground/70 mb-1 block">Kota</Label>
          <Select
            value={searchParams.get("city") ?? "semua"}
            onValueChange={(v) => updateFilter("city", v)}
          >
            <SelectTrigger className="h-9 text-sm rounded-xl bg-background border border-border focus:ring-2 focus:ring-primary">
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

        <div>
          <Label className="text-[11px] font-medium uppercase tracking-[0.16em] text-foreground/70 mb-1 block">Harga Min (Juta)</Label>
          <Input
            key={minPrice ?? ""}
            type="number"
            min={0}
            placeholder="Contoh: 500"
            className="h-9 text-sm rounded-xl bg-background border border-border focus:ring-2 focus:ring-primary"
            defaultValue={rupiahToJuta(minPrice)}
            onBlur={(e) => updateFilter("minPrice", jutaToRupiah(e.target.value))}
          />
        </div>

        <div>
          <Label className="text-[11px] font-medium uppercase tracking-[0.16em] text-foreground/70 mb-1 block">Harga Max (Juta)</Label>
          <Input
            key={maxPrice ?? ""}
            type="number"
            min={0}
            placeholder="Contoh: 2000"
            className="h-9 text-sm rounded-xl bg-background border border-border focus:ring-2 focus:ring-primary"
            defaultValue={rupiahToJuta(maxPrice)}
            onBlur={(e) => updateFilter("maxPrice", jutaToRupiah(e.target.value))}
          />
        </div>

        <div>
          <Label className="text-[11px] font-medium uppercase tracking-[0.16em] text-foreground/70 mb-1 block">Min Kamar Tidur</Label>
          <Select
            value={searchParams.get("minBedrooms") ?? "semua"}
            onValueChange={(v) => updateFilter("minBedrooms", v)}
          >
            <SelectTrigger className="h-9 text-sm rounded-xl bg-background border border-border focus:ring-2 focus:ring-primary">
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
      </div>
    </div>
  )
}
