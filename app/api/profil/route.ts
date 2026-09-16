import { NextRequest, NextResponse } from "next/server"
import { db } from "@/db"
import { profiles } from "@/db/schema"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { eq } from "drizzle-orm"
import { rateLimit, getRateLimitKey } from "@/lib/rate-limit"
import bcrypt from "bcryptjs"
import { z } from "zod"

// Every field is optional so the avatar uploader can keep sending `{ avatarUrl }`
// alone, while the profile form sends only what the user actually edited.
// `phone` accepts "" as an explicit "clear this field".
const updateProfileSchema = z
  .object({
    avatarUrl: z.string().url().optional(),
    fullName: z.string().min(2, "Nama minimal 2 karakter").max(100).optional(),
    phone: z.string().max(30).optional(),
    currentPassword: z.string().optional(),
    newPassword: z.string().min(8, "Password baru minimal 8 karakter").optional(),
  })
  .refine((d) => Object.keys(d).length > 0, "Tidak ada perubahan")
  .refine(
    (d) => (d.newPassword === undefined) === (d.currentPassword === undefined),
    "Password lama dan baru harus diisi bersamaan",
  )

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const [profile] = await db
      .select({
        fullName: profiles.fullName,
        email: profiles.email,
        phone: profiles.phone,
        avatarUrl: profiles.avatarUrl,
      })
      .from(profiles)
      .where(eq(profiles.id, session.user.id!))
      .limit(1)

    if (!profile) {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }

    return NextResponse.json(profile)
  } catch (error) {
    console.error("[GET /api/profil]", error)
    return NextResponse.json({ error: "Terjadi kesalahan pada server" }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const ip = req.headers.get("x-forwarded-for") ?? "unknown"
    const limit = await rateLimit(getRateLimitKey(ip, "profile-update"), { windowMs: 60_000, max: 30 })
    if (!limit.success) {
      return NextResponse.json({ error: "Terlalu banyak permintaan. Coba lagi nanti." }, { status: 429 })
    }

    const body = await req.json()
    const parsed = updateProfileSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validasi gagal", details: parsed.error.flatten() },
        { status: 400 },
      )
    }

    const { avatarUrl, fullName, phone, currentPassword, newPassword } = parsed.data
    const updateData: Record<string, string | null> = {}

    if (avatarUrl !== undefined) updateData.avatarUrl = avatarUrl
    if (fullName !== undefined) updateData.fullName = fullName
    if (phone !== undefined) updateData.phone = phone || null

    // A password change must prove ownership of the current password, so it is
    // verified against the stored hash before anything is written.
    if (newPassword !== undefined && currentPassword !== undefined) {
      const [profile] = await db
        .select({ passwordHash: profiles.passwordHash })
        .from(profiles)
        .where(eq(profiles.id, session.user.id!))
        .limit(1)

      if (!profile) {
        return NextResponse.json({ error: "Not found" }, { status: 404 })
      }

      const valid = await bcrypt.compare(currentPassword, profile.passwordHash)
      if (!valid) {
        return NextResponse.json({ error: "Password lama tidak cocok" }, { status: 400 })
      }

      updateData.passwordHash = await bcrypt.hash(newPassword, 10)
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: "Tidak ada perubahan" }, { status: 400 })
    }

    await db.update(profiles).set(updateData).where(eq(profiles.id, session.user.id!))

    return NextResponse.json({ ok: true, avatarUrl, fullName, phone })
  } catch (error) {
    console.error("[PATCH /api/profil]", error)
    return NextResponse.json({ error: "Terjadi kesalahan pada server" }, { status: 500 })
  }
}
