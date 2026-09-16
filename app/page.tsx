import Link from "next/link"
import { db } from "@/db"
import { properties, profiles } from "@/db/schema"
import { eq, desc, and, isNull, sql } from "drizzle-orm"
import { ArrowRight } from "lucide-react"
import PropertyCard from "@/components/PropertyCard"
import HeroSection from "@/components/HeroSection"
import AboutSection from "@/components/AboutSection"
import HowWeWork from "@/components/HowWeWork"
import ExploreTypes from "@/components/ExploreTypes"
import PopularCities from "@/components/PopularCities"
import ContactSection from "@/components/ContactSection"
import type { PropertyWithImages } from "@/lib/types"
import { getPropertiesWithImagesBatch, getFavoritePropertyIds } from "@/lib/db-helpers"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { BRAND } from "@/lib/brand"

export const revalidate = 60

async function getFeaturedProperties(): Promise<PropertyWithImages[]> {
  return getPropertiesWithImagesBatch(
    db
      .select()
      .from(properties)
      .where(and(eq(properties.status, "active"), isNull(properties.deletedAt)))
      .orderBy(desc(properties.createdAt))
      .limit(6),
  )
}

async function getAboutStats() {
  const [listingRow, cityRow, agentRow] = await Promise.all([
    db
      .select({ n: sql<number>`count(*)::int` })
      .from(properties)
      .where(and(eq(properties.status, "active"), isNull(properties.deletedAt))),
    db
      .select({ n: sql<number>`count(distinct ${properties.city})::int` })
      .from(properties)
      .where(and(eq(properties.status, "active"), isNull(properties.deletedAt))),
    db
      .select({ n: sql<number>`count(*)::int` })
      .from(profiles)
      .where(sql`${profiles.role} IN ('agent', 'admin')`),
  ])

  const formatN = (n: number) => (n >= 1000 ? `${Math.floor(n / 100) / 10}k+` : `${n}+`)

  return [
    { n: formatN(Number(listingRow[0]?.n ?? 0)), label: "active listings" },
    { n: formatN(Number(cityRow[0]?.n ?? 0)), label: "cities covered" },
    { n: formatN(Number(agentRow[0]?.n ?? 0)), label: "trusted agents" },
  ] as const
}

export default async function HomePage() {
  const [featured, stats, session] = await Promise.all([
    getFeaturedProperties(),
    getAboutStats(),
    getServerSession(authOptions),
  ])
  const favoriteIds = session?.user?.id ? await getFavoritePropertyIds(session.user.id) : new Set<string>()

  return (
    <div>
      <HeroSection />
      <AboutSection stats={stats} />
      <HowWeWork />

      <section className="container mx-auto px-4 py-16 sm:py-20">
        <div className="mb-10 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-end">
          <div>
            <p className="mb-3 flex items-center gap-2.5 text-[11px] font-medium uppercase tracking-[0.22em] text-primary">
              <span aria-hidden className="h-px w-6 bg-gold/70" />
              {BRAND.exploreTypes.heading}
            </p>
            <h2 className="font-sans text-2xl font-semibold tracking-tight text-foreground sm:text-4xl">
              Cari Properti Sesuai Kebutuhan
            </h2>
          </div>
        </div>
        <ExploreTypes />
      </section>

      <section id="listing" className="container mx-auto px-4 py-16 sm:py-20">
        <div className="mb-10 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-end">
          <div>
            <p className="mb-3 flex items-center gap-2.5 text-[11px] font-medium uppercase tracking-[0.22em] text-primary">
              <span aria-hidden className="h-px w-6 bg-gold/70" />
              Listing
            </p>
            <h2 className="font-sans text-2xl font-semibold tracking-tight text-foreground sm:text-4xl">
              Properti Pilihan
            </h2>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-[15px]">
              Listing terbaru dari agen terpercaya di seluruh Indonesia.
            </p>
          </div>
          {featured.length > 0 && (
            <Link
              href="/properti"
              className="group inline-flex items-center gap-1.5 self-start rounded-full border border-primary px-4 py-2 text-[12px] font-semibold uppercase tracking-[0.12em] text-primary transition-colors hover:bg-primary hover:text-primary-foreground sm:self-auto"
            >
              Lihat semua
              <ArrowRight
                size={13}
                className="transition-transform group-hover:translate-x-0.5"
              />
            </Link>
          )}
        </div>
        {featured.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border py-16 text-center">
            <p className="text-sm text-muted-foreground">
              Belum ada listing aktif saat ini.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((property) => (
              <PropertyCard key={property.id} property={property} initialFavorited={favoriteIds.has(property.id)} />
            ))}
          </div>
        )}
      </section>

      <PopularCities />
      <ContactSection />
    </div>
  )
}
