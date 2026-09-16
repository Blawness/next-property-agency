import { NextRequest, NextResponse } from "next/server"
import { db } from "@/db"
import { profiles } from "@/db/schema"
import { eq } from "drizzle-orm"
import bcrypt from "bcryptjs"
import { z } from "zod"
import { rateLimit, getRateLimitKey } from "@/lib/rate-limit"

const registerSchema = z.object({
  name: z.string().min(2, "Nama minimal 2 karakter"),
  email: z.string().email("Format email tidak valid"),
  password: z.string().min(8, "Password minimal 8 karakter"),
})

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for") ?? "unknown"
    const limit = await rateLimit(getRateLimitKey(ip, "register"), { windowMs: 60_000, max: 30 })
    if (!limit.success) {
      return NextResponse.json({ error: "Terlalu banyak permintaan. Coba lagi nanti." }, { status: 429 })
    }

    const body = await req.json()
    const parsed = registerSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validasi gagal", details: parsed.error.flatten() },
        { status: 400 },
      )
    }

    const { name, email, password } = parsed.data

    const existing = await db
      .select()
      .from(profiles)
      .where(eq(profiles.email, email))
      .limit(1)

    if (existing.length > 0) {
      return NextResponse.json({ error: "Email sudah terdaftar." }, { status: 409 })
    }

    const passwordHash = await bcrypt.hash(password, 10)
    await db.insert(profiles).values({
      fullName: name,
      email,
      passwordHash,
      role: "buyer",
    })

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("[POST /api/auth/register]", error)
    return NextResponse.json({ error: "Terjadi kesalahan pada server" }, { status: 500 })
  }
}
