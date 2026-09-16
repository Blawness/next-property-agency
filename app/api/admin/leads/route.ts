import { NextRequest, NextResponse } from "next/server"
import { db } from "@/db"
import { leads, properties } from "@/db/schema"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { desc, eq, inArray } from "drizzle-orm"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const allLeads = await db
      .select()
      .from(leads)
      .orderBy(desc(leads.createdAt))
      .limit(100)

    const propertyIds = allLeads.map((l) => l.propertyId).filter((id): id is string => id !== null)
    const props = propertyIds.length > 0
      ? await db.select({ id: properties.id, title: properties.title }).from(properties).where(inArray(properties.id, propertyIds))
      : []

    const propertyMap = new Map(props.map((p) => [p.id, p.title]))

    const result = allLeads.map((lead) => ({
      ...lead,
      propertyTitle: lead.propertyId ? propertyMap.get(lead.propertyId) ?? null : null,
    }))

    return NextResponse.json({ leads: result })
  } catch (error) {
    console.error("[GET /api/admin/leads]", error)
    return NextResponse.json({ error: "Terjadi kesalahan pada server" }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { id, status } = await req.json()

    if (!id || typeof id !== "string") {
      return NextResponse.json({ error: "id is required" }, { status: 400 })
    }

    if (!status || !["new", "contacted", "closed"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 })
    }

    await db.update(leads).set({ status }).where(eq(leads.id, id))

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("[PATCH /api/admin/leads]", error)
    return NextResponse.json({ error: "Terjadi kesalahan pada server" }, { status: 500 })
  }
}
