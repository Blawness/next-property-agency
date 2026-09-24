import Link from "next/link"
import { db } from "@/db"
import { properties } from "@/db/schema"
import { eq, desc, and, isNull } from "drizzle-orm"
import { ArrowRight } from "lucide-react"
import Reveal from "@/components/Reveal"
import ManifestoBand from "@/components/ManifestoBand"
import HomeListingCard from "@/components/HomeListingCard"
import HeroSection from "@/components/HeroSection"
import HomeMotion from "@/components/HomeMotion"
import AboutSection from "@/components/AboutSection"
import HowWeWork from "@/components/HowWeWork"
import ExploreTypes from "@/components/ExploreTypes"
import PopularCities from "@/components/PopularCities"
import ContactSection from "@/components/ContactSection"
import type { PropertyWithImages } from "@/lib/types"
import { getPropertiesWithImagesBatch, getFavoritePropertyIds } from "@/lib/db-helpers"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

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

export default async function HomePage() {
  const [featured, session] = await Promise.all([
    getFeaturedProperties(),
    getServerSession(authOptions),
  ])
  const favoriteIds = session?.user?.id ? await getFavoritePropertyIds(session.user.id) : new Set<string>()

  // The small inset photo in About is a live listing when there is one.
  const firstListingImage = featured
    .map((p) => (p.images.find((i) => i.isPrimary) ?? p.images[0])?.url)
    .find((url): url is string => Boolean(url))

  return (
    <div>
      <HomeMotion />
      <HeroSection />
      <AboutSection secondaryImage={firstListingImage ?? null} />
      <HowWeWork />
      <ManifestoBand />

      <section id="listing" className="mx-auto max-w-[1440px] px-[clamp(1.25rem,5vw,4.5rem)] py-[clamp(6rem,11vw,9rem)]">
        <Reveal
          effect="drift"
          className="mb-[clamp(3rem,6vw,5rem)] flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-end"
        >
          <div>
            <p className="mb-8 flex items-center gap-3 text-[11px] font-medium uppercase tracking-[0.32em] text-muted-foreground">
              <span className="font-serif text-[15px] italic tracking-normal text-primary">03</span>
              <span aria-hidden className="h-px w-8 bg-gold" />
              Koleksi
            </p>
            <h2 data-split className="m-0 font-serif text-[clamp(2.5rem,4.8vw,4.25rem)] font-light leading-[1.02] tracking-[-0.01em] text-foreground">
              Properti <span className="italic">Pilihan</span>
            </h2>
            <p className="mt-6 max-w-[46ch] text-[16px] leading-[1.85] text-muted-foreground">
              Listing terbaru dari agen terpercaya di seluruh Indonesia.
            </p>
          </div>
          {featured.length > 0 && (
            <Link
              href="/properti"
              className="group inline-flex items-center gap-3 border-b border-foreground/40 pb-2 text-[12px] font-semibold uppercase tracking-[0.2em] text-foreground transition-colors hover:border-primary hover:text-primary"
            >
              Lihat semua koleksi
              <ArrowRight
                size={15}
                strokeWidth={1.5}
                className="transition-transform duration-500 group-hover:translate-x-1"
              />
            </Link>
          )}
        </Reveal>

        <ExploreTypes />

        <div className="mt-[clamp(3rem,6vw,5rem)]">
          {featured.length === 0 ? (
            <div className="border border-dashed border-border py-16 text-center">
              <p className="text-sm text-muted-foreground">
                Belum ada listing aktif saat ini.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-x-8 gap-y-16 sm:grid-cols-2 lg:grid-cols-3">
              {featured.map((property, i) => (
                <Reveal key={property.id} effect="drift" delay={(i % 3) * 120}>
                  <HomeListingCard property={property} initialFavorited={favoriteIds.has(property.id)} />
                </Reveal>
              ))}
            </div>
          )}
        </div>
      </section>

      <PopularCities />
      {/* The brown behind the contact block is the footer's: HomeMotion
          clips the block into a card as the footer rises, and the card
          should sit on the colour it is about to become. */}
      <div className="bg-accent">
        <div data-footer-clip>
          <ContactSection />
        </div>
      </div>
    </div>
  )
}
