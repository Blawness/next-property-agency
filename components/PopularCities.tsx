import Link from "next/link"
import Image from "next/image"
import { db } from "@/db"
import { properties } from "@/db/schema"
import { and, eq, isNull, count } from "drizzle-orm"
import { ArrowUpRight } from "lucide-react"
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
    <section className="bg-ivory">
      <div className="mx-auto max-w-[1440px] px-[clamp(1.25rem,5vw,4.5rem)] py-[clamp(6rem,11vw,9rem)]">
        <Reveal effect="drift" className="mb-[clamp(3rem,6vw,5rem)] grid grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-x-12">
          <div className="lg:col-span-6">
            <p className="mb-8 flex items-center gap-3 text-[11px] font-medium uppercase tracking-[0.32em] text-muted-foreground">
              <span className="font-serif text-[15px] italic tracking-normal text-primary">04</span>
              <span aria-hidden className="h-px w-8 bg-gold" />
              Lokasi
            </p>
            <h2 className="m-0 font-serif text-[clamp(2.5rem,4.8vw,4.25rem)] font-light leading-[1.02] tracking-[-0.01em] text-foreground">
              {BRAND.popularCities.heading}
            </h2>
          </div>
          <p className="max-w-[40ch] text-[16px] leading-[1.85] text-muted-foreground lg:col-span-4 lg:col-start-9 lg:self-end">
            Dari pusat kota hingga pesisir — alamat yang kami kenal dengan baik.
          </p>
        </Reveal>

        <div className="grid auto-rows-[190px] grid-cols-2 gap-3 md:auto-rows-[240px] md:grid-cols-4 md:gap-4">
          {BRAND.popularCities.cities.map((city, i) => (
            <Reveal
              key={city.name}
              effect="unveil"
              delay={i * 110}
              className={cn(BENTO[i % BENTO.length])}
            >
              <Link
                href={`/properti?city=${city.name}`}
                className="group relative block h-full w-full overflow-hidden"
              >
                <Image
                  src={city.image}
                  alt={city.name}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover transition-transform duration-[1600ms] ease-out group-hover:scale-[1.06]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#140A04]/80 via-[#140A04]/15 to-transparent transition-opacity duration-700 group-hover:opacity-90" />
                <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-5 sm:p-6">
                  <div>
                    <p className="font-serif text-[clamp(1.5rem,2.4vw,2.25rem)] font-light leading-none text-white">
                      {city.name}
                    </p>
                    <p className="mt-2 text-[10px] font-medium uppercase tracking-[0.28em] text-white/65">
                      {counts[city.name.toLowerCase()] ?? 0} properti
                    </p>
                  </div>
                  <ArrowUpRight
                    size={20}
                    strokeWidth={1.25}
                    className="shrink-0 text-white/80 transition-transform duration-500 group-hover:-translate-y-1 group-hover:translate-x-1"
                  />
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
