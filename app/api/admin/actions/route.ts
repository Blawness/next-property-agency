import { NextRequest, NextResponse } from "next/server"
import { db } from "@/db"
import { adminActions, profiles } from "@/db/schema"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { desc, inArray } from "drizzle-orm"

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { searchParams } = new URL(req.url)
    const limit = Math.min(parseInt(searchParams.get("limit") ?? "50", 10), 100)

    const actions = await db
      .select()
      .from(adminActions)
      .orderBy(desc(adminActions.createdAt))
      .limit(limit)

    const adminIds = actions.map((a) => a.adminId).filter((id): id is string => id !== null)
    const admins = adminIds.length > 0
      ? await db.select({ id: profiles.id, fullName: profiles.fullName }).from(profiles).where(inArray(profiles.id, adminIds))
      : []

    const adminMap = new Map(admins.map((a) => [a.id, a.fullName]))

    const result = actions.map((action) => ({
      ...action,
      adminName: action.adminId ? adminMap.get(action.adminId) ?? "Unknown" : "System",
    }))

    return NextResponse.json({ actions: result })
  } catch (error) {
    console.error("[GET /api/admin/actions]", error)
    return NextResponse.json({ error: "Terjadi kesalahan pada server" }, { status: 500 })
  }
}
