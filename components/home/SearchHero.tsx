"use client"

import { useState } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { BRAND } from "@/lib/brand"
import { PROPERTY_TYPES, PROPERTY_TYPE_LABELS } from "@/lib/constants"

const SEARCH_FIELDS = ["q", "type", "listingType"] as const

/** The catalog URL for a hero search, leaving out every field left blank. */
export function searchHref(form: FormData): string {
  const params = new URLSearchParams()
  for (const key of SEARCH_FIELDS) {
    const value = String(form.get(key) ?? "").trim()
    if (value) params.set(key, value)
  }
  const query = params.toString()
  return query ? `/properti?${query}` : "/properti"
}

// Radix Select and ToggleGroup take no empty value, so "all" is a sentinel;
// the hidden inputs below submit it as blank, which searchHref leaves out.
const ALL = "semua"

const LISTING_OPTIONS = [
  { value: ALL, label: "Semua" },
  { value: "jual", label: "Dijual" },
  { value: "sewa", label: "Disewa" },
]

const FIELD = "h-12 rounded-full border-border bg-background text-sm"

/**
 * The homepage's opening section. A GET form to /properti: without JavaScript
 * the search box still works on its own; with it, the type and jual/sewa
 * choices ride along and blank fields are left out of the URL.
 */
export default function SearchHero() {
  const router = useRouter()
  const { searchHero } = BRAND
  const [type, setType] = useState(ALL)
  const [listingType, setListingType] = useState(ALL)

  return (
    <section id="home" className="container mx-auto px-4 pt-4 sm:pt-6">
      <div className="relative overflow-hidden rounded-2xl bg-accent">
        <Image
          src={searchHero.image}
          alt={searchHero.imageAlt}
          fill
          loading="eager"
          fetchPriority="high"
          // Below sm the stacked form makes the banner taller than wide, so
          // object-cover draws the 3:2 photo ~735–825px wide at any phone width.
          sizes="(max-width: 639px) 830px, (max-width: 1535px) 100vw, 1504px"
          className="object-cover"
        />
        <div aria-hidden className="absolute inset-0 bg-gradient-to-r from-black/65 via-black/35 to-black/10" />

        <div className="relative px-5 py-12 sm:px-10 sm:py-16 lg:py-20">
          <h1 className="max-w-2xl text-3xl font-bold leading-tight text-white sm:text-4xl lg:text-5xl">
            {searchHero.headline}
          </h1>
          <p className="mt-3 max-w-xl text-[15px] text-white/85 sm:text-base">{searchHero.subtitle}</p>

          <form
            action="/properti"
            method="get"
            onSubmit={(e) => {
              e.preventDefault()
              router.push(searchHref(new FormData(e.currentTarget)))
            }}
            className="mt-8 rounded-2xl bg-background p-3 shadow-lg sm:p-4 lg:max-w-4xl"
          >
            <ToggleGroup
              type="single"
              variant="outline"
              aria-label="Dijual atau disewa"
              value={listingType}
              // Always one choice: pressing the active item again keeps it.
              onValueChange={(v) => v && setListingType(v)}
              className="mb-3"
            >
              {LISTING_OPTIONS.map((o) => (
                <ToggleGroupItem key={o.value} value={o.value} className="h-8 border-border px-4 text-[13px]">
                  {o.label}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
            <input type="hidden" name="listingType" value={listingType === ALL ? "" : listingType} />
            <input type="hidden" name="type" value={type === ALL ? "" : type} />

            <div className="flex flex-col gap-2 sm:flex-row">
              <label className="relative flex-1">
                <span className="sr-only">Lokasi atau kata kunci</span>
                <Search
                  aria-hidden
                  className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                />
                <Input name="q" type="search" placeholder={searchHero.placeholder} className={`${FIELD} pl-10 pr-4`} />
              </label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger aria-label="Tipe properti" className={`${FIELD} !h-12 w-full px-4 sm:w-44`}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL}>Semua tipe</SelectItem>
                  {PROPERTY_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>
                      {PROPERTY_TYPE_LABELS[t]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button type="submit" className="h-12 px-7 font-semibold">
                {searchHero.cta}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </section>
  )
}
