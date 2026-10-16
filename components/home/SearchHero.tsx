"use client"

import Image from "next/image"
import { useRouter } from "next/navigation"
import { Search } from "lucide-react"
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

const LISTING_OPTIONS = [
  { value: "", label: "Semua" },
  { value: "jual", label: "Dijual" },
  { value: "sewa", label: "Disewa" },
]

const FIELD =
  "h-12 w-full rounded-full border border-border bg-background text-sm text-foreground outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"

/**
 * The homepage's opening section. A plain GET form, so it searches without
 * JavaScript too; with it, blank fields are left out of the URL.
 */
export default function SearchHero() {
  const router = useRouter()
  const { searchHero } = BRAND

  return (
    <section id="home" className="container mx-auto px-4 pt-4 sm:pt-6">
      <div className="relative overflow-hidden rounded-2xl bg-accent">
        <Image
          src={searchHero.image}
          alt={searchHero.imageAlt}
          fill
          loading="eager"
          fetchPriority="high"
          sizes="(max-width: 1535px) 100vw, 1504px"
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
            <fieldset className="mb-3 flex gap-2">
              <legend className="sr-only">Dijual atau disewa</legend>
              {LISTING_OPTIONS.map((o) => (
                <label key={o.label} className="cursor-pointer">
                  <input
                    type="radio"
                    name="listingType"
                    value={o.value}
                    defaultChecked={o.value === ""}
                    className="peer sr-only"
                  />
                  <span className="inline-flex h-8 items-center rounded-full border border-border px-4 text-[13px] font-medium text-muted-foreground transition-colors peer-checked:border-primary peer-checked:bg-primary peer-checked:text-primary-foreground peer-focus-visible:ring-2 peer-focus-visible:ring-ring">
                    {o.label}
                  </span>
                </label>
              ))}
            </fieldset>

            <div className="flex flex-col gap-2 sm:flex-row">
              <label className="relative flex-1">
                <span className="sr-only">Lokasi atau kata kunci</span>
                <Search
                  aria-hidden
                  className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                />
                <input name="q" type="search" placeholder={searchHero.placeholder} className={`${FIELD} pl-10 pr-4`} />
              </label>
              <label className="sm:w-44">
                <span className="sr-only">Tipe properti</span>
                <select name="type" defaultValue="" className={`${FIELD} px-4`}>
                  <option value="">Semua tipe</option>
                  {PROPERTY_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {PROPERTY_TYPE_LABELS[t]}
                    </option>
                  ))}
                </select>
              </label>
              <button
                type="submit"
                className="h-12 rounded-full bg-primary px-7 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
              >
                {searchHero.cta}
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  )
}
