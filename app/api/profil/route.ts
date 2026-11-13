import { NextRequest, NextResponse } from "next/server"
import { db } from "@/db"
import { profiles } from "@/db/schema"
import { auth, getSession } from "@/lib/auth"
import { eq } from "drizzle-orm"
import { rateLimit, getRateLimitKey } from "@/lib/rate-limit"
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
    const session = await getSession()
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
      .where(eq(profiles.id, session.user.id))
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
    const session = await getSession()
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

    // Neon Auth checks the current password and stores the new one. Every
    // other session of the account ends with it, so a stolen one stops here.
    if (newPassword !== undefined && currentPassword !== undefined) {
      const { error: passwordError } = await auth.changePassword({
        currentPassword,
        newPassword,
        revokeOtherSessions: true,
      })
      if (passwordError) {
        // The server SDK normalises Better Auth's INVALID_PASSWORD to this.
        const wrongPassword = passwordError.code === "invalid_credentials"
        return NextResponse.json(
          { error: wrongPassword ? "Password lama tidak cocok" : "Gagal mengganti password" },
          { status: wrongPassword ? 400 : 502 },
        )
      }
    }

    if (Object.keys(updateData).length > 0) {
      await db.update(profiles).set(updateData).where(eq(profiles.id, session.user.id))
    }

    return NextResponse.json({ ok: true, avatarUrl, fullName, phone })
  } catch (error) {
    console.error("[PATCH /api/profil]", error)
    return NextResponse.json({ error: "Terjadi kesalahan pada server" }, { status: 500 })
  }
}
