import type { PropertyWithImages } from "@/lib/types"

/** The homepage panel's category row: everything, then each property type. */
export const PANEL_CATEGORIES = ["semua", "rumah", "apartemen", "tanah", "ruko"] as const
export type PanelCategory = (typeof PANEL_CATEGORIES)[number]
export type ListingGroups = Record<PanelCategory, PropertyWithImages[]>

/**
 * Splits one listing type's newest listings into the panel's categories, so
 * switching category in the browser needs no query. Order is kept; every
 * group, "semua" included, holds at most `perGroup`.
 */
export function groupByType(items: PropertyWithImages[], perGroup = 10): ListingGroups {
  const groups = Object.fromEntries(PANEL_CATEGORIES.map((c) => [c, []])) as unknown as ListingGroups
  for (const item of items) {
    if (groups.semua.length < perGroup) groups.semua.push(item)
    const own = groups[item.type as PanelCategory]
    if (own && own.length < perGroup) own.push(item)
  }
  return groups
}
