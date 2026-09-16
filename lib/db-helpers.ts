import { db } from "@/db"
import { properties, propertyImages, favorites } from "@/db/schema"
import { inArray, eq } from "drizzle-orm"
import type { PropertyWithImages } from "@/lib/types"
import type { InferSelectModel } from "drizzle-orm"

type PropertyRow = InferSelectModel<typeof properties>
type PropertyImageRow = InferSelectModel<typeof propertyImages>

// NOTE: callers must filter `isNull(properties.deletedAt)` for public reads.
// Admin routes may omit the filter to inspect soft-deleted rows.

export async function getFavoritePropertyIds(userId: string): Promise<Set<string>> {
  const rows = await db
    .select({ propertyId: favorites.propertyId })
    .from(favorites)
    .where(eq(favorites.userId, userId))
  return new Set(rows.map((r) => r.propertyId).filter((id): id is string => id !== null))
}

export async function getPropertiesWithImagesBatch(
  query: Promise<PropertyRow[]>,
): Promise<PropertyWithImages[]> {
  const rows = await query

  if (rows.length === 0) return []

  const ids = rows.map((r) => r.id)
  const images = await db
    .select()
    .from(propertyImages)
    .where(inArray(propertyImages.propertyId, ids))
    .orderBy(propertyImages.order)

  const imageMap = new Map<string, PropertyImageRow[]>()
  for (const img of images) {
    if (img.propertyId) {
      const arr = imageMap.get(img.propertyId) ?? []
      arr.push(img)
      imageMap.set(img.propertyId, arr)
    }
  }

  return rows.map((prop) => ({
    ...prop,
    images: imageMap.get(prop.id) ?? [],
  }))
}
