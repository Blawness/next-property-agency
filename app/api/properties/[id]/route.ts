import { NextRequest, NextResponse } from "next/server"
import { db } from "@/db"
import { properties, propertyImages, adminActions, profiles } from "@/db/schema"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { and, eq, isNull } from "drizzle-orm"
import { rateLimit, getRateLimitKey } from "@/lib/rate-limit"
import { z } from "zod"
import {
  priceField,
  countField,
  latField,
  lngField,
  roomsFor,
  validationErrorMessage,
} from "@/lib/property-fields"

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { id } = await params
    // A deleted listing is gone from the admin table; opening its edit URL
    // directly must not let it be edited back to "active" while it stays
    // hidden from the public site by deletedAt.
    const [property] = await db
      .select()
      .from(properties)
      .where(and(eq(properties.id, id), isNull(properties.deletedAt)))
      .limit(1)

    if (!property) {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }

    const images = await db
      .select()
      .from(propertyImages)
      .where(eq(propertyImages.propertyId, id))
      .orderBy(propertyImages.order)

    return NextResponse.json({ ...property, images })
  } catch (error) {
    console.error("[GET /api/properties]", error)
    return NextResponse.json({ error: "Terjadi kesalahan pada server" }, { status: 500 })
  }
}

// PATCH allows partial updates; empty strings for required fields are rejected
// with a 400 instead of bubbling to a 500 from the DB not-null constraint.
const nonEmptyString = z
  .string()
  .min(1, "Tidak boleh kosong")
  .refine((v) => v.trim().length > 0, "Tidak boleh kosong")

const propertyUpdateSchema = z.object({
  title: nonEmptyString.optional(),
  description: z.string().optional(),
  price: priceField.optional(),
  type: z.enum(["rumah", "apartemen", "tanah", "ruko"]).optional(),
  listingType: z.enum(["jual", "sewa"]).optional(),
  status: z.enum(["active", "sold", "rented", "archived"]).optional(),
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

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const ip = req.headers.get("x-forwarded-for") ?? "unknown"
    const limit = await rateLimit(getRateLimitKey(ip, "property-update"), { windowMs: 60_000, max: 30 })
    if (!limit.success) {
      return NextResponse.json({ error: "Terlalu banyak permintaan. Coba lagi nanti." }, { status: 429 })
    }

    const { id } = await params
    const body = await req.json()
    const parsed = propertyUpdateSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: validationErrorMessage(parsed.error), details: parsed.error.flatten() },
        { status: 400 },
      )
    }

    const { imageUrls, ...fields } = parsed.data

    // Without this an unknown or deleted id updated zero rows and still
    // answered ok, so the form reported "Properti diperbarui" for nothing.
    const [existing] = await db
      .select({ type: properties.type })
      .from(properties)
      .where(and(eq(properties.id, id), isNull(properties.deletedAt)))
      .limit(1)
    if (!existing) {
      return NextResponse.json({ error: "Properti tidak ditemukan" }, { status: 404 })
    }
    const effectiveType = fields.type ?? existing.type

    // An empty agentId clears the assignment; a non-empty one must name a real
    // profile with role='agent'.
    if (fields.agentId) {
      const [agent] = await db
        .select({ id: profiles.id })
        .from(profiles)
        .where(and(eq(profiles.id, fields.agentId), eq(profiles.role, "agent")))
        .limit(1)
      if (!agent) {
        return NextResponse.json({ error: "Agen tidak valid" }, { status: 400 })
      }
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
    if (fields.landArea !== undefined) updateData.landArea = fields.landArea ? parseInt(fields.landArea, 10) : null
    if (fields.buildingArea !== undefined) updateData.buildingArea = fields.buildingArea ? parseInt(fields.buildingArea, 10) : null
    if (fields.agentId !== undefined) updateData.agentId = fields.agentId || null
    if (fields.bedrooms !== undefined || effectiveType === "tanah") {
      updateData.bedrooms = roomsFor(effectiveType, fields.bedrooms ? parseInt(fields.bedrooms, 10) : null)
    }
    if (fields.bathrooms !== undefined || effectiveType === "tanah") {
      updateData.bathrooms = roomsFor(effectiveType, fields.bathrooms ? parseInt(fields.bathrooms, 10) : null)
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

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("[PATCH /api/properties]", error)
    return NextResponse.json({ error: "Terjadi kesalahan pada server" }, { status: 500 })
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const ip = _req.headers.get("x-forwarded-for") ?? "unknown"
    const limit = await rateLimit(getRateLimitKey(ip, "property-delete"), { windowMs: 60_000, max: 30 })
    if (!limit.success) {
      return NextResponse.json({ error: "Terlalu banyak permintaan. Coba lagi nanti." }, { status: 429 })
    }

    const { id } = await params
    const now = new Date()
    const [updated] = await db
      .update(properties)
      .set({ deletedAt: now, status: "archived" })
      // Deleting twice would overwrite the original deletion time and log a
      // second delete in the activity log.
      .where(and(eq(properties.id, id), isNull(properties.deletedAt)))
      .returning({ id: properties.id })

    if (!updated) {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }

    await db.insert(adminActions).values({
      adminId: session.user.id ?? null,
      action: "property.soft_delete",
      entityType: "property",
      entityId: id,
    })

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("[DELETE /api/properties]", error)
    return NextResponse.json({ error: "Terjadi kesalahan pada server" }, { status: 500 })
  }
}
