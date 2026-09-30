import { NextRequest, NextResponse } from "next/server"
import { db } from "@/db"
import { properties, propertyImages, profiles } from "@/db/schema"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { PropertyStatus, PropertyType } from "@/lib/types"
import { PROPERTY_TYPES, escapeLikePattern } from "@/lib/constants"
import {
  priceField,
  countField,
  latField,
  lngField,
  roomsFor,
  validationErrorMessage,
} from "@/lib/property-fields"
import { z } from "zod"
import { eq, and, ilike, desc, or, count, inArray, isNull } from "drizzle-orm"
import { rateLimit, getRateLimitKey } from "@/lib/rate-limit"

const PROPERTY_STATUSES = ["active", "sold", "rented", "archived"] as const

function isPropertyStatus(s: string): s is PropertyStatus {
  return (PROPERTY_STATUSES as readonly string[]).includes(s)
}

function isPropertyType(s: string): s is (typeof PROPERTY_TYPES)[number] {
  return (PROPERTY_TYPES as readonly string[]).includes(s)
}

const propertySchema = z.object({
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

// An admin may hand a listing to any agent, but only to a profile that really
// carries role='agent' — otherwise the public AgentCard would show a buyer's
// (or another admin's) contact details. Falls back to the acting admin.
async function resolveAgentId(
  requested: string | undefined,
  fallback: string | undefined,
): Promise<string | null | undefined> {
  if (!requested) return fallback
  const [agent] = await db
    .select({ id: profiles.id })
    .from(profiles)
    .where(and(eq(profiles.id, requested), eq(profiles.role, "agent")))
    .limit(1)
  return agent?.id ?? null
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { searchParams } = new URL(req.url)
    // NaN or a negative number would reach OFFSET/LIMIT and fail the query.
    const rawPage = parseInt(searchParams.get("page") ?? "1", 10)
    const rawLimit = parseInt(searchParams.get("limit") ?? "20", 10)
    const page = Number.isFinite(rawPage) && rawPage > 0 ? rawPage : 1
    const limit = Number.isFinite(rawLimit) && rawLimit > 0 ? Math.min(rawLimit, 100) : 20
    const status = searchParams.get("status")
    const type = searchParams.get("type")
    const city = searchParams.get("city")
    const search = searchParams.get("search")

    if (status && !isPropertyStatus(status)) {
      return NextResponse.json({ error: "Status tidak valid" }, { status: 400 })
    }
    if (type && !isPropertyType(type)) {
      return NextResponse.json({ error: "Tipe properti tidak valid" }, { status: 400 })
    }

    // "Hapus" is a soft delete, so without this a deleted listing stayed in the
    // admin table as "Diarsipkan" — it looked as if Hapus had done nothing.
    const conditions = [isNull(properties.deletedAt)]

    if (status) conditions.push(eq(properties.status, status as PropertyStatus))
    if (type) conditions.push(eq(properties.type, type as PropertyType))
    if (city) conditions.push(eq(properties.city, city))
    if (search) {
      // Case-insensitive, like the public catalog: "rumah" has to find
      // "Rumah Minimalis".
      const pattern = `%${escapeLikePattern(search)}%`
      conditions.push(
        or(
          ilike(properties.title, pattern),
          ilike(properties.city, pattern),
        )!
      )
    }

    const where = and(...conditions)

    const [countResult] = await db
      .select({ count: count() })
      .from(properties)
      .where(where)

    const total = countResult?.count ?? 0

    const items = await db
      .select()
      .from(properties)
      .where(where)
      // Newest first: oldest-first put a listing just created on the last
      // page, out of sight of the admin who was redirected here to see it.
      // The id keeps rows created together in a stable order across pages.
      .orderBy(desc(properties.createdAt), desc(properties.id))
      .limit(limit)
      .offset((page - 1) * limit)

    // Batch fetch primary images
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

    return NextResponse.json({
      items: items.map((p) => ({ ...p, primaryImageUrl: imageMap.get(p.id) ?? null })),
      total,
      page,
      limit,
    })
  } catch (error) {
    console.error("[GET /api/properties]", error)
    return NextResponse.json({ error: "Terjadi kesalahan pada server" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    if (session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const ip = req.headers.get("x-forwarded-for") ?? "unknown"
    const limit = await rateLimit(getRateLimitKey(ip, "property-create"), { windowMs: 60_000, max: 30 })
    if (!limit.success) {
      return NextResponse.json({ error: "Terlalu banyak permintaan. Coba lagi nanti." }, { status: 429 })
    }

    const body = await req.json()
    const parsed = propertySchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: validationErrorMessage(parsed.error), details: parsed.error.flatten() },
        { status: 400 },
      )
    }

    const { imageUrls = [], ...fields } = parsed.data

    const agentId = await resolveAgentId(fields.agentId, session.user.id)
    if (agentId === null) {
      return NextResponse.json({ error: "Agen tidak valid" }, { status: 400 })
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
        landArea: fields.landArea ? parseInt(fields.landArea, 10) : null,
        buildingArea: fields.buildingArea ? parseInt(fields.buildingArea, 10) : null,
        bedrooms: roomsFor(fields.type, fields.bedrooms ? parseInt(fields.bedrooms, 10) : null),
        bathrooms: roomsFor(fields.type, fields.bathrooms ? parseInt(fields.bathrooms, 10) : null),
        agentId,
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

    return NextResponse.json({ id: property.id })
  } catch (error) {
    console.error("[POST /api/properties]", error)
    return NextResponse.json({ error: "Terjadi kesalahan pada server" }, { status: 500 })
  }
}
