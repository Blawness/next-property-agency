import { db } from "@/db"
import { properties } from "@/db/schema"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import SearchHero from "@/components/home/SearchHero"
import ListingRail from "@/components/home/ListingRail"
import BenefitsGrid from "@/components/home/BenefitsGrid"
import ContactCta from "@/components/home/ContactCta"
import HashScroll from "@/components/home/HashScroll"
import PopularCities from "@/components/PopularCities"
import { budgetChips } from "@/components/home/rail-chips"
import ListingPanel from "@/components/home/ListingPanel"
import { groupByType } from "@/lib/listing-groups"
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
// Newest listings fetched per listing type for the panel: enough that the
// rarer property types still fill their own category after grouping.
const PANEL_FETCH = 48

/** The newest visible listings for a catalog filter — the same rules the catalog applies. */
function newestMatching(raw: RawCatalogParams, limit = RAIL_SIZE): Promise<PropertyWithImages[]> {
  return getPropertiesWithImagesBatch(
    db
      .select()
      .from(properties)
      .where(catalogConditions(parseCatalogFilters(raw)))
      .orderBy(...CATALOG_ORDER_BY.terbaru)
      .limit(limit),
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
  const [forSale, forRent, budget, session] = await Promise.all([
    newestMatching({ listingType: "jual" }, PANEL_FETCH),
    newestMatching({ listingType: "sewa" }, PANEL_FETCH),
    getBudgetShowcase(),
    getServerSession(authOptions),
  ])
  const favoriteIds = session?.user?.id ? await getFavoritePropertyIds(session.user.id) : new Set<string>()

  return (
    <>
      <SearchHero />
      <ListingPanel
        groups={{ jual: groupByType(forSale), sewa: groupByType(forRent) }}
        favoriteIds={[...favoriteIds]}
      />
      {budget && (
        <ListingRail
          heading={BRAND.budgetRail.heading}
          subheading={`Properti dijual ${budget.range.label}`}
          chips={budgetChips(budget.range)}
          properties={budget.items}
          favoriteIds={favoriteIds}
          seeAllHref={budgetHref(budget.range)}
        />
      )}
      <PopularCities />
      <BenefitsGrid />
      <ContactCta />
      <HashScroll />
    </>
  )
}
