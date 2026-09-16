import { NextRequest, NextResponse } from "next/server"
import { db } from "@/db"
import { leads } from "@/db/schema"
import { rateLimit, getRateLimitKey } from "@/lib/rate-limit"
import { z } from "zod"

const leadSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  message: z.string().min(10).max(1000),
  propertyId: z.string().optional(),
})

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for") ?? "unknown"
    const limit = await rateLimit(getRateLimitKey(ip, "lead-create"), { windowMs: 60_000, max: 5 })
    if (!limit.success) {
      return NextResponse.json({ error: "Terlalu banyak permintaan. Coba lagi nanti." }, { status: 429 })
    }

    const body = await req.json()
    const parsed = leadSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validasi gagal", details: parsed.error.flatten() },
        { status: 400 },
      )
    }

    const { name, email, message, propertyId } = parsed.data

    await db.insert(leads).values({
      name,
      email,
      message,
      propertyId: propertyId || null,
      status: "new",
    })

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("[POST /api/leads]", error)
    return NextResponse.json({ error: "Terjadi kesalahan pada server" }, { status: 500 })
  }
}
