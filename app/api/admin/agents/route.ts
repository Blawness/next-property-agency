import { NextRequest, NextResponse } from "next/server"
import { db } from "@/db"
import { profiles, properties } from "@/db/schema"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { eq, count, inArray } from "drizzle-orm"
import { rateLimit, getRateLimitKey } from "@/lib/rate-limit"
import bcrypt from "bcryptjs"
import { z } from "zod"

const createAgentSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  avatarUrl: z.string().url().optional(),
})

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const agents = await db
      .select({
        id: profiles.id,
        fullName: profiles.fullName,
        email: profiles.email,
        phone: profiles.phone,
        avatarUrl: profiles.avatarUrl,
        createdAt: profiles.createdAt,
      })
      .from(profiles)
      .where(eq(profiles.role, "agent"))
      .orderBy(profiles.createdAt)

    const agentIds = agents.map((a) => a.id)
    const countRows = agentIds.length > 0
      ? await db
          .select({ agentId: properties.agentId, count: count() })
          .from(properties)
          .where(inArray(properties.agentId, agentIds))
          .groupBy(properties.agentId)
      : []

    const countMap = new Map<string, number>()
    for (const row of countRows) {
      if (row.agentId) countMap.set(row.agentId, row.count)
    }

    const agentsWithCounts = agents.map((agent) => ({
      ...agent,
      propertyCount: countMap.get(agent.id) ?? 0,
    }))

    return NextResponse.json({ agents: agentsWithCounts })
  } catch (error) {
    console.error("[GET /api/admin/agents]", error)
    return NextResponse.json({ error: "Terjadi kesalahan pada server" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const ip = req.headers.get("x-forwarded-for") ?? "unknown"
    const limit = await rateLimit(getRateLimitKey(ip, "agent-create"), { windowMs: 60_000, max: 30 })
    if (!limit.success) {
      return NextResponse.json({ error: "Terlalu banyak permintaan. Coba lagi nanti." }, { status: 429 })
    }

    const body = await req.json()
    const parsed = createAgentSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validasi gagal", details: parsed.error.flatten() },
        { status: 400 },
      )
    }

    const { name, email, phone, avatarUrl } = parsed.data

    const existing = await db
      .select()
      .from(profiles)
      .where(eq(profiles.email, email))
      .limit(1)

    if (existing.length > 0) {
      return NextResponse.json({ error: "Email sudah terdaftar." }, { status: 409 })
    }

    const tempPassword = Math.random().toString(36).slice(-8)
    const passwordHash = await bcrypt.hash(tempPassword, 10)

    const [agent] = await db
      .insert(profiles)
      .values({
        fullName: name,
        email,
        passwordHash,
        phone: phone || null,
        avatarUrl: avatarUrl || null,
        role: "agent",
      })
      .returning()

    return NextResponse.json({ id: agent.id, tempPassword })
  } catch (error) {
    console.error("[POST /api/admin/agents]", error)
    return NextResponse.json({ error: "Terjadi kesalahan pada server" }, { status: 500 })
  }
}
