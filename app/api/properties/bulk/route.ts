import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { z } from "zod"
import { db } from "@/db"
import { properties, adminActions } from "@/db/schema"
import { inArray } from "drizzle-orm"
import { rateLimit, getRateLimitKey } from "@/lib/rate-limit"

const bulkSchema = z.object({
  ids: z.array(z.string().min(1)).min(1).max(100),
  status: z.enum(["active", "sold", "rented", "archived"]),
})

export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const ip = req.headers.get("x-forwarded-for") ?? "unknown"
    const limit = await rateLimit(getRateLimitKey(ip, "property-bulk"), { windowMs: 60_000, max: 10 })
    if (!limit.success) {
      return NextResponse.json({ error: "Terlalu banyak permintaan. Coba lagi nanti." }, { status: 429 })
    }

    const body = await req.json()
    const parsed = bulkSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: "Validasi gagal", details: parsed.error.flatten() }, { status: 400 })
    }
    const { ids, status } = parsed.data

    const updated = await db
      .update(properties)
      .set({ status, updatedAt: new Date() })
      .where(inArray(properties.id, ids))
      .returning({ id: properties.id })

    if (updated.length > 0) {
      await db.insert(adminActions).values(
        updated.map((u) => ({
          adminId: session.user.id ?? null,
          action: `property.bulk_status.${status}`,
          entityType: "property",
          entityId: u.id,
          metadata: JSON.stringify({ bulk: true, count: ids.length }),
        })),
      )
    }

    return NextResponse.json({ updated: updated.length, requested: ids.length })
  } catch (error) {
    console.error("[PATCH /api/properties/bulk]", error)
    return NextResponse.json({ error: "Terjadi kesalahan pada server" }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const ip = req.headers.get("x-forwarded-for") ?? "unknown"
    const limit = await rateLimit(getRateLimitKey(ip, "property-bulk-delete"), { windowMs: 60_000, max: 10 })
    if (!limit.success) {
      return NextResponse.json({ error: "Terlalu banyak permintaan. Coba lagi nanti." }, { status: 429 })
    }

    const body = await req.json()
    const parsed = z.object({ ids: z.array(z.string().min(1)).min(1).max(100) }).safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: "Validasi gagal" }, { status: 400 })
    }

    const now = new Date()
    const updated = await db
      .update(properties)
      .set({ deletedAt: now, status: "archived" })
      .where(inArray(properties.id, parsed.data.ids))
      .returning({ id: properties.id })

    if (updated.length > 0) {
      await db.insert(adminActions).values(
        updated.map((u) => ({
          adminId: session.user.id ?? null,
          action: "property.bulk_soft_delete",
          entityType: "property",
          entityId: u.id,
          metadata: JSON.stringify({ bulk: true, count: parsed.data.ids.length }),
        })),
      )
    }

    return NextResponse.json({ updated: updated.length, requested: parsed.data.ids.length })
  } catch (error) {
    console.error("[DELETE /api/properties/bulk]", error)
    return NextResponse.json({ error: "Terjadi kesalahan pada server" }, { status: 500 })
  }
}
