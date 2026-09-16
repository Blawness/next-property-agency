import { NextResponse } from "next/server"
import { db } from "@/db"
import { properties, profiles } from "@/db/schema"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { eq, count, gte, and } from "drizzle-orm"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const [totalResult] = await db
      .select({ count: count() })
      .from(properties)

    const [activeResult] = await db
      .select({ count: count() })
      .from(properties)
      .where(eq(properties.status, "active"))

    const [agentResult] = await db
      .select({ count: count() })
      .from(profiles)
      .where(eq(profiles.role, "agent"))

    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1)
    const [monthResult] = await db
      .select({ count: count() })
      .from(properties)
      .where(and(eq(properties.status, "active"), gte(properties.createdAt, startOfMonth)))

    return NextResponse.json({
      totalProperties: totalResult?.count ?? 0,
      activeProperties: activeResult?.count ?? 0,
      totalAgents: agentResult?.count ?? 0,
      propertiesThisMonth: monthResult?.count ?? 0,
    })
  } catch (error) {
    console.error("[GET /api/admin/stats]", error)
    return NextResponse.json({ error: "Terjadi kesalahan pada server" }, { status: 500 })
  }
}
