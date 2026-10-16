import Link from "next/link"
import Image from "next/image"
import { db } from "@/db"
import { properties } from "@/db/schema"
import { and, eq, isNull, count } from "drizzle-orm"
import { BRAND } from "@/lib/brand"

// City photos are 4:3 and the tiles 4:5, so with object-cover a photo is drawn
// at 5/4 x 4/3 ≈ 1.67x its tile's width: tiles are ~50vw below sm, ~33vw to lg,
// and at most ~240px in the six-column row.
const CITY_TILE_SIZES = "(max-width: 639px) 85vw, (max-width: 1023px) 56vw, 400px"

async function getCityCounts(): Promise<Record<string, number>> {
  const rows = await db
    .select({ city: properties.city, total: count() })
    .from(properties)
    .where(and(eq(properties.status, "active"), isNull(properties.deletedAt)))
    .groupBy(properties.city)
  return Object.fromEntries(rows.map((r) => [r.city.toLowerCase(), r.total]))
}

export default async function PopularCities() {
  const counts = await getCityCounts()
  const { popularCities } = BRAND

  return (
    <section className="container mx-auto px-4 py-10 sm:py-12">
      <h2 className="text-xl font-bold text-accent sm:text-2xl">{popularCities.heading}</h2>
      <p className="mt-1 text-sm text-muted-foreground">{popularCities.subtitle}</p>
      <ul className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-6">
        {popularCities.cities.map((city) => (
          <li key={city.name}>
            <Link
              href={`/properti?city=${encodeURIComponent(city.name)}`}
              prefetch={false}
              className="group relative block aspect-[4/5] overflow-hidden rounded-xl bg-muted"
            >
              <Image
                src={city.image}
                alt={city.name}
                fill
                sizes={CITY_TILE_SIZES}
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-3 sm:p-4">
                <p className="text-base font-bold text-white sm:text-lg">{city.name}</p>
                <p className="text-xs text-white/80">{counts[city.name.toLowerCase()] ?? 0} properti</p>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}
