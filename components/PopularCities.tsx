import Link from "next/link"
import Image from "next/image"
import { db } from "@/db"
import { properties } from "@/db/schema"
import { and, eq, isNull, count } from "drizzle-orm"
import { MapPin } from "lucide-react"
import SectionHeading from "@/components/SectionHeading"
import Reveal from "@/components/Reveal"
import { cn } from "@/lib/utils"
import { BRAND } from "@/lib/brand"

const BENTO = [
  "col-span-2 row-span-2",
  "col-span-2",
  "",
  "",
  "col-span-2",
  "col-span-2",
]

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

  return (
    <section className="container mx-auto px-4 py-16 sm:py-20">
      <SectionHeading
        eyebrow="Lokasi"
        title={BRAND.popularCities.heading}
        subtitle="Listing properti di kota-kota besar Indonesia"
      />
      <div className="grid auto-rows-[150px] grid-cols-2 gap-4 md:auto-rows-[190px] md:grid-cols-4">
        {BRAND.popularCities.cities.map((city, i) => (
          <Reveal key={city.name} delay={i * 70} className={cn(BENTO[i % BENTO.length])}>
            <Link
              href={`/properti?city=${city.name}`}
              className="group relative block h-full w-full overflow-hidden rounded-3xl"
            >
              <Image
                src={city.image}
                alt={city.name}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-accent/85 via-accent/25 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-5">
                <p className="flex items-center gap-1.5 font-sans text-lg font-semibold italic text-white">
                  <MapPin size={14} className="text-gold" />
                  {city.name}
                </p>
                <p className="mt-0.5 pl-5 text-[10px] font-medium uppercase tracking-[0.16em] text-white/60">
                  {counts[city.name.toLowerCase()] ?? 0} properti
                </p>
              </div>
            </Link>
          </Reveal>
        ))}
      </div>
    </section>
  )
}
