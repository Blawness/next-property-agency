"use client"

import { useState } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Home, MapPin, Search, Tag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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
  { value: ALL, label: "Dijual & disewa" },
  { value: "jual", label: "Dijual" },
  { value: "sewa", label: "Disewa" },
]


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
    <section
      id="home"
      className="relative -mt-16 h-[520px] overflow-hidden rounded-bl-[2.5rem] bg-accent sm:h-[600px] sm:rounded-bl-[5rem]"
    >
      <Image
        src={searchHero.image}
        alt={searchHero.imageAlt}
        fill
        loading="eager"
        fetchPriority="high"
        // Full-bleed. Below md the banner is taller than a 3:2 photo is wide
        // at that width, so object-cover draws it ~780–840px wide.
        sizes="(max-width: 767px) 840px, 100vw"
        className="object-cover"
      />
      <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/25 to-black/30" />

      <div className="container relative mx-auto flex h-full flex-col justify-end px-4 pb-10 sm:pb-14">
        <h1 className="max-w-2xl text-3xl font-bold leading-tight text-white sm:text-5xl">{searchHero.headline}</h1>
        <p className="mt-2 max-w-xl text-[15px] font-medium text-white/90 sm:text-lg">{searchHero.subtitle}</p>

        <form
          action="/properti"
          method="get"
          onSubmit={(e) => {
            e.preventDefault()
            router.push(searchHref(new FormData(e.currentTarget)))
          }}
          className="mt-6 flex items-center rounded-full bg-background p-1.5 shadow-xl sm:p-2"
        >
          <input type="hidden" name="type" value={type === ALL ? "" : type} />
          <input type="hidden" name="listingType" value={listingType === ALL ? "" : listingType} />

          <label className="relative flex min-w-0 flex-1 items-center">
            <span className="sr-only">Lokasi atau kata kunci</span>
            <MapPin aria-hidden className="pointer-events-none absolute left-4 h-5 w-5 text-muted-foreground" />
            <Input
              name="q"
              type="search"
              placeholder={searchHero.placeholder}
              className="h-11 border-0 bg-transparent pl-12 shadow-none focus-visible:ring-0 sm:h-12"
            />
          </label>

          {/* Type and jual/sewa ride along from sm up; on a phone the pill is
              the query alone, and the catalog has every filter. */}
          <div className="hidden items-center sm:flex">
            <span aria-hidden className="h-8 w-px bg-border" />
            <Select value={type} onValueChange={setType}>
              <SelectTrigger aria-label="Tipe properti" className="!h-12 w-40 border-0 shadow-none focus-visible:ring-0">
                <Home aria-hidden className="text-muted-foreground" />
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
            <span aria-hidden className="h-8 w-px bg-border" />
            <Select value={listingType} onValueChange={setListingType}>
              <SelectTrigger aria-label="Dijual atau disewa" className="!h-12 w-44 border-0 shadow-none focus-visible:ring-0">
                <Tag aria-hidden className="text-muted-foreground" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LISTING_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button type="submit" className="h-11 w-11 shrink-0 px-0 font-semibold sm:h-12 sm:w-auto sm:px-7">
            <Search aria-hidden />
            <span className="sr-only sm:not-sr-only">{searchHero.cta}</span>
          </Button>
        </form>
      </div>
    </section>
  )
}
