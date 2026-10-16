import { PROPERTY_TYPES, PROPERTY_TYPE_LABELS } from "@/lib/constants"
import { BUDGET_RANGES, budgetHref, type BudgetRange } from "@/lib/budget-ranges"
import type { RailChip } from "@/components/home/ListingRail"

/** "Pilihan Untukmu": every type, plus rentals. Each opens the catalog filtered. */
export const TYPE_CHIPS: readonly RailChip[] = [
  { label: "Semua", href: "/properti", active: true },
  ...PROPERTY_TYPES.map((t) => ({ label: PROPERTY_TYPE_LABELS[t], href: `/properti?type=${t}` })),
  { label: "Disewakan", href: "/properti?listingType=sewa" },
]

/** The budget chips, with the band the rail is showing marked. */
export function budgetChips(shown: BudgetRange): RailChip[] {
  return BUDGET_RANGES.map((range) => ({
    label: range.label,
    href: budgetHref(range),
    active: range.id === shown.id,
  }))
}
