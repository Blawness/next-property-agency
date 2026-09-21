import { db } from "@/db"
import { properties, propertyImages, favorites, profiles } from "@/db/schema"
import { inArray, eq, and, isNull, count } from "drizzle-orm"
import type { PropertyWithImages, PublicAgent } from "@/lib/types"
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

  // Second batched read rather than a join: listing cards offer a WhatsApp
  // enquiry, and that needs the agent's number without an N+1 per card.
  const agentIds = [
    ...new Set(rows.map((r) => r.agentId).filter((id): id is string => id !== null)),
  ]
  const phoneByAgent = new Map<string, string | null>()
  if (agentIds.length > 0) {
    const agents = await db
      .select({ id: profiles.id, phone: profiles.phone })
      .from(profiles)
      .where(inArray(profiles.id, agentIds))
    for (const a of agents) phoneByAgent.set(a.id, a.phone)
  }

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
    agentPhone: prop.agentId ? (phoneByAgent.get(prop.agentId) ?? null) : null,
  }))
}

/**
 * Agents as the public site lists them, newest listing-carriers included.
 * The count is of *visible* listings — active and not soft-deleted — so a
 * profile never promises properties a visitor cannot open. One grouped count
 * query rather than one per agent.
 */
export async function getPublicAgents(): Promise<PublicAgent[]> {
  const rows = await db
    .select({
      id: profiles.id,
      fullName: profiles.fullName,
      title: profiles.title,
      bio: profiles.bio,
      phone: profiles.phone,
      avatarUrl: profiles.avatarUrl,
      createdAt: profiles.createdAt,
    })
    .from(profiles)
    .where(eq(profiles.role, "agent"))
    .orderBy(profiles.fullName)

  if (rows.length === 0) return []

  const counts = await db
    .select({ agentId: properties.agentId, n: count() })
    .from(properties)
    .where(
      and(
        inArray(
          properties.agentId,
          rows.map((r) => r.id),
        ),
        eq(properties.status, "active"),
        isNull(properties.deletedAt),
      ),
    )
    .groupBy(properties.agentId)

  const countByAgent = new Map<string, number>()
  for (const row of counts) {
    if (row.agentId) countByAgent.set(row.agentId, row.n)
  }

  return rows.map((r) => ({ ...r, listingCount: countByAgent.get(r.id) ?? 0 }))
}

/** One agent by id, or null when the id is not an agent (a buyer, or missing). */
export async function getPublicAgent(id: string): Promise<PublicAgent | null> {
  const [row] = await db
    .select({
      id: profiles.id,
      fullName: profiles.fullName,
      title: profiles.title,
      bio: profiles.bio,
      phone: profiles.phone,
      avatarUrl: profiles.avatarUrl,
      createdAt: profiles.createdAt,
    })
    .from(profiles)
    .where(and(eq(profiles.id, id), eq(profiles.role, "agent")))
    .limit(1)

  if (!row) return null

  const [tally] = await db
    .select({ n: count() })
    .from(properties)
    .where(
      and(
        eq(properties.agentId, id),
        eq(properties.status, "active"),
        isNull(properties.deletedAt),
      ),
    )

  return { ...row, listingCount: tally?.n ?? 0 }
}
