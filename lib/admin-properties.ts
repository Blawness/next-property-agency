import { z } from "zod"
import { and, count, desc, eq, ilike, inArray, isNull, or } from "drizzle-orm"
import { db } from "@/db"
import { profiles, properties, propertyImages } from "@/db/schema"
import { escapeLikePattern } from "@/lib/constants"
import { countField, latField, lngField, priceField, roomsFor } from "@/lib/property-fields"
import type { PropertyStatus, PropertyType } from "@/lib/types"

/**
 * Listing writes and the admin listing query, shared by the admin REST routes
 * (`/api/properties`) and the MCP server (`/api/mcp`) so a listing posted from
 * Claude obeys exactly the rules of one posted from the admin form. Callers do
 * their own auth: everything here assumes an admin is acting.
 */

export const PROPERTY_STATUSES = ["active", "sold", "rented", "archived"] as const

export const propertyCreateSchema = z.object({
  title: z.string().min(1, "Judul wajib diisi"),
  description: z.string().optional(),
  price: priceField,
  type: z.enum(["rumah", "apartemen", "tanah", "ruko"]),
  listingType: z.enum(["jual", "sewa"]),
  city: z.string().trim().min(1, "Kota wajib diisi"),
  address: z.string().optional(),
  lat: latField.optional(),
  lng: lngField.optional(),
  landArea: countField.optional(),
  buildingArea: countField.optional(),
  bedrooms: countField.optional(),
  bathrooms: countField.optional(),
  agentId: z.string().optional(),
  imageUrls: z.array(z.string().url()).optional(),
})

// PATCH allows partial updates; empty strings for required fields are rejected
// with a 400 instead of bubbling to a 500 from the DB not-null constraint.
const nonEmptyString = z
  .string()
  .min(1, "Tidak boleh kosong")
  .refine((v) => v.trim().length > 0, "Tidak boleh kosong")

export const propertyUpdateSchema = z.object({
  title: nonEmptyString.optional(),
  description: z.string().optional(),
  price: priceField.optional(),
  type: z.enum(["rumah", "apartemen", "tanah", "ruko"]).optional(),
  listingType: z.enum(["jual", "sewa"]).optional(),
  status: z.enum(PROPERTY_STATUSES).optional(),
  // Required on create, so an edit must not be able to blank it either: the
  // city filter and every card's location line depend on it.
  city: nonEmptyString.optional(),
  address: z.string().optional(),
  lat: latField.optional(),
  lng: lngField.optional(),
  landArea: countField.optional(),
  buildingArea: countField.optional(),
  bedrooms: countField.optional(),
  bathrooms: countField.optional(),
  agentId: z.string().optional(),
  imageUrls: z.array(z.string().url()).optional(),
})

export type PropertyCreateInput = z.infer<typeof propertyCreateSchema>
export type PropertyUpdateInput = z.infer<typeof propertyUpdateSchema>

/** A refused write, with the HTTP status the REST routes answer it with. */
export class PropertyWriteError extends Error {
  constructor(
    message: string,
    readonly status: 400 | 404,
  ) {
    super(message)
    this.name = "PropertyWriteError"
  }
}

// A listing may only be handed to a profile that really carries role='agent' —
// otherwise the public AgentCard would show a buyer's (or another admin's)
// contact details.
async function isAgent(id: string): Promise<boolean> {
  const [agent] = await db
    .select({ id: profiles.id })
    .from(profiles)
    .where(and(eq(profiles.id, id), eq(profiles.role, "agent")))
    .limit(1)
  return Boolean(agent)
}

function toInt(value: string | undefined): number | null {
  return value ? parseInt(value, 10) : null
}

/**
 * Inserts a listing and its photos (first photo is the cover). Without an
 * `agentId` the listing belongs to `actingAdminId`.
 */
export async function createProperty(input: PropertyCreateInput, actingAdminId: string): Promise<string> {
  const { imageUrls = [], ...fields } = input

  if (fields.agentId && !(await isAgent(fields.agentId))) {
    throw new PropertyWriteError("Agen tidak valid", 400)
  }

  const [property] = await db
    .insert(properties)
    .values({
      title: fields.title,
      description: fields.description || null,
      price: fields.price,
      type: fields.type,
      listingType: fields.listingType,
      city: fields.city,
      address: fields.address || null,
      lat: fields.lat || null,
      lng: fields.lng || null,
      landArea: toInt(fields.landArea),
      buildingArea: toInt(fields.buildingArea),
      bedrooms: roomsFor(fields.type, toInt(fields.bedrooms)),
      bathrooms: roomsFor(fields.type, toInt(fields.bathrooms)),
      agentId: fields.agentId || actingAdminId,
    })
    .returning()

  if (imageUrls.length > 0) {
    await db.insert(propertyImages).values(
      imageUrls.map((url, i) => ({
        propertyId: property.id,
        url,
        isPrimary: i === 0,
        order: i,
      })),
    )
  }

  return property.id
}

/**
 * Applies a partial edit. `imageUrls`, when given, replaces the whole gallery
 * in that order; an empty `agentId` clears the assignment.
 */
export async function updateProperty(id: string, input: PropertyUpdateInput): Promise<void> {
  const { imageUrls, ...fields } = input

  // Without this an unknown or deleted id updated zero rows and still
  // answered ok, so the form reported "Properti diperbarui" for nothing.
  const [existing] = await db
    .select({ type: properties.type })
    .from(properties)
    .where(and(eq(properties.id, id), isNull(properties.deletedAt)))
    .limit(1)
  if (!existing) {
    throw new PropertyWriteError("Properti tidak ditemukan", 404)
  }
  const effectiveType = fields.type ?? existing.type

  if (fields.agentId && !(await isAgent(fields.agentId))) {
    throw new PropertyWriteError("Agen tidak valid", 400)
  }

  const updateData: Record<string, string | number | null> = {}
  if (fields.title !== undefined) updateData.title = fields.title
  if (fields.description !== undefined) updateData.description = fields.description || null
  if (fields.price !== undefined) updateData.price = fields.price
  if (fields.type !== undefined) updateData.type = fields.type
  if (fields.listingType !== undefined) updateData.listingType = fields.listingType
  if (fields.status !== undefined) updateData.status = fields.status
  if (fields.city !== undefined) updateData.city = fields.city
  if (fields.address !== undefined) updateData.address = fields.address || null
  if (fields.lat !== undefined) updateData.lat = fields.lat || null
  if (fields.lng !== undefined) updateData.lng = fields.lng || null
  if (fields.landArea !== undefined) updateData.landArea = toInt(fields.landArea)
  if (fields.buildingArea !== undefined) updateData.buildingArea = toInt(fields.buildingArea)
  if (fields.agentId !== undefined) updateData.agentId = fields.agentId || null
  if (fields.bedrooms !== undefined || effectiveType === "tanah") {
    updateData.bedrooms = roomsFor(effectiveType, toInt(fields.bedrooms))
  }
  if (fields.bathrooms !== undefined || effectiveType === "tanah") {
    updateData.bathrooms = roomsFor(effectiveType, toInt(fields.bathrooms))
  }

  if (Object.keys(updateData).length > 0) {
    await db
      .update(properties)
      .set({ ...updateData, updatedAt: new Date() })
      .where(eq(properties.id, id))
  }

  if (imageUrls !== undefined) {
    await db.delete(propertyImages).where(eq(propertyImages.propertyId, id))
    if (imageUrls.length > 0) {
      await db.insert(propertyImages).values(
        imageUrls.map((url, i) => ({
          propertyId: id,
          url,
          isPrimary: i === 0,
          order: i,
        })),
      )
    }
  }
}

export interface AdminPropertyFilters {
  page: number
  limit: number
  status?: PropertyStatus
  type?: PropertyType
  listingType?: "jual" | "sewa"
  city?: string
  search?: string
}

/**
 * The admin listing table: every listing that is not soft-deleted, newest
 * first, with its cover photo. "Hapus" is a soft delete, so without the
 * deletedAt filter a deleted listing stayed in the table as "Diarsipkan" — it
 * looked as if Hapus had done nothing.
 */
export async function listAdminProperties(filters: AdminPropertyFilters) {
  const conditions = [isNull(properties.deletedAt)]
  if (filters.status) conditions.push(eq(properties.status, filters.status))
  if (filters.type) conditions.push(eq(properties.type, filters.type))
  if (filters.listingType) conditions.push(eq(properties.listingType, filters.listingType))
  if (filters.city) conditions.push(eq(properties.city, filters.city))
  if (filters.search) {
    // Case-insensitive, like the public catalog: "rumah" has to find
    // "Rumah Minimalis".
    const pattern = `%${escapeLikePattern(filters.search)}%`
    conditions.push(or(ilike(properties.title, pattern), ilike(properties.city, pattern))!)
  }
  const where = and(...conditions)

  const [countResult] = await db.select({ count: count() }).from(properties).where(where)
  const total = countResult?.count ?? 0

  const items = await db
    .select()
    .from(properties)
    .where(where)
    // Newest first: oldest-first put a listing just created on the last
    // page, out of sight of the admin who was redirected here to see it.
    // The id keeps rows created together in a stable order across pages.
    .orderBy(desc(properties.createdAt), desc(properties.id))
    .limit(filters.limit)
    .offset((filters.page - 1) * filters.limit)

  const ids = items.map((p) => p.id)
  const images =
    ids.length > 0
      ? await db
          .select()
          .from(propertyImages)
          .where(and(inArray(propertyImages.propertyId, ids), eq(propertyImages.isPrimary, true)))
      : []

  const imageMap = new Map<string, string>()
  for (const img of images) {
    if (img.propertyId) imageMap.set(img.propertyId, img.url)
  }

  return {
    items: items.map((p) => ({ ...p, primaryImageUrl: imageMap.get(p.id) ?? null })),
    total,
    page: filters.page,
    limit: filters.limit,
  }
}

/** One listing that is not soft-deleted, with its photos in gallery order. */
export async function getAdminProperty(id: string) {
  // A deleted listing is gone from the admin table; opening its edit URL
  // directly must not let it be edited back to "active" while it stays
  // hidden from the public site by deletedAt.
  const [property] = await db
    .select()
    .from(properties)
    .where(and(eq(properties.id, id), isNull(properties.deletedAt)))
    .limit(1)
  if (!property) return null

  const images = await db
    .select()
    .from(propertyImages)
    .where(eq(propertyImages.propertyId, id))
    .orderBy(propertyImages.order)

  return { ...property, images }
}
