import { BUDGET_RANGES, budgetHref, type BudgetRange } from "@/lib/budget-ranges"
import type { RailChip } from "@/components/home/ListingRail"

/** The budget chips, with the band the rail is showing marked. */
export function budgetChips(shown: BudgetRange): RailChip[] {
  return BUDGET_RANGES.map((range) => ({
    label: range.label,
    href: budgetHref(range),
    active: range.id === shown.id,
  }))
}
