import { db } from "@/db"
import { properties } from "@/db/schema"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import SearchHero from "@/components/home/SearchHero"
import ListingRail from "@/components/home/ListingRail"
import BenefitsGrid from "@/components/home/BenefitsGrid"
import ContactCta from "@/components/home/ContactCta"
import PopularCities from "@/components/PopularCities"
import { TYPE_CHIPS, budgetChips } from "@/components/home/rail-chips"
import { BUDGET_RANGES, budgetHref, budgetParams, type BudgetRange } from "@/lib/budget-ranges"
import {
  CATALOG_ORDER_BY,
  catalogConditions,
  parseCatalogFilters,
  type RawCatalogParams,
} from "@/lib/catalog-query"
import { getPropertiesWithImagesBatch, getFavoritePropertyIds } from "@/lib/db-helpers"
import { BRAND } from "@/lib/brand"
import type { PropertyWithImages } from "@/lib/types"

export const revalidate = 60

const RAIL_SIZE = 10

/** The newest visible listings for a catalog filter — the same rules the catalog applies. */
function newestMatching(raw: RawCatalogParams): Promise<PropertyWithImages[]> {
  return getPropertiesWithImagesBatch(
    db
      .select()
      .from(properties)
      .where(catalogConditions(parseCatalogFilters(raw)))
      .orderBy(...CATALOG_ORDER_BY.terbaru)
      .limit(RAIL_SIZE),
  )
}

/**
 * The cheapest budget band that has any sale listing, with its listings — or
 * null when nothing is for sale, so the section is left out rather than empty.
 * Usually one query; at most one per band.
 */
async function getBudgetShowcase(): Promise<{ range: BudgetRange; items: PropertyWithImages[] } | null> {
  for (const range of BUDGET_RANGES) {
    const items = await newestMatching(budgetParams(range))
    if (items.length > 0) return { range, items }
  }
  return null
}

export default async function HomePage() {
  const [latest, budget, session] = await Promise.all([
    newestMatching({}),
    getBudgetShowcase(),
    getServerSession(authOptions),
  ])
  const favoriteIds = session?.user?.id ? await getFavoritePropertyIds(session.user.id) : new Set<string>()

  return (
    <>
      <SearchHero />
      <ListingRail
        heading={BRAND.listingRail.heading}
        subheading={BRAND.listingRail.subheading}
        chips={TYPE_CHIPS}
        properties={latest}
        favoriteIds={favoriteIds}
        seeAllHref="/properti"
      />
      {budget && (
        <ListingRail
          heading={BRAND.budgetRail.heading}
          subheading={`Properti dijual ${budget.range.label}`}
          chips={budgetChips(budget.range)}
          properties={budget.items}
          favoriteIds={favoriteIds}
          seeAllHref={budgetHref(budget.range)}
          className="pt-0 sm:pt-0"
        />
      )}
      <PopularCities />
      <BenefitsGrid />
      <ContactCta />
    </>
  )
}
