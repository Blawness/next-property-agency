import { NextRequest, NextResponse } from "next/server"
import { db } from "@/db"
import { properties, adminActions } from "@/db/schema"
import { getSession } from "@/lib/auth"
import { and, eq, isNull } from "drizzle-orm"
import { rateLimit, getRateLimitKey } from "@/lib/rate-limit"
import { validationErrorMessage } from "@/lib/property-fields"
import {
  PropertyWriteError,
  getAdminProperty,
  propertyUpdateSchema,
  updateProperty,
} from "@/lib/admin-properties"

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { id } = await params
    const property = await getAdminProperty(id)
    if (!property) {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }

    return NextResponse.json(property)
  } catch (error) {
    console.error("[GET /api/properties]", error)
    return NextResponse.json({ error: "Terjadi kesalahan pada server" }, { status: 500 })
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()
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

    await updateProperty(id, parsed.data)
    return NextResponse.json({ ok: true })
  } catch (error) {
    if (error instanceof PropertyWriteError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }
    console.error("[PATCH /api/properties]", error)
    return NextResponse.json({ error: "Terjadi kesalahan pada server" }, { status: 500 })
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()
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
