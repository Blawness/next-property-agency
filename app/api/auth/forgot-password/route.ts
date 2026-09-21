import { NextRequest, NextResponse } from "next/server"
import { db } from "@/db"
import { profiles, passwordResetTokens } from "@/db/schema"
import { and, eq, isNull } from "drizzle-orm"
import { rateLimit, getRateLimitKey } from "@/lib/rate-limit"
import { buildPasswordResetEmail, sendMail } from "@/lib/notify"
import { generateResetToken, hashResetToken, RESET_TOKEN_TTL_MS } from "@/lib/password-reset"
import { SITE_URL } from "@/lib/constants"
import { z } from "zod"

const forgotSchema = z.object({ email: z.string().email() })

/**
 * The response is identical whether or not the address has an account. Telling
 * them apart would turn this endpoint into a way to enumerate who is registered.
 */
const GENERIC_RESPONSE = {
  ok: true,
  message: "Jika email tersebut terdaftar, kami sudah mengirim tautan untuk mengatur ulang password.",
}

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for") ?? "unknown"
    const limit = await rateLimit(getRateLimitKey(ip, "forgot-password"), {
      windowMs: 15 * 60 * 1000,
      max: 5,
    })
    if (!limit.success) {
      return NextResponse.json(
        { error: "Terlalu banyak permintaan. Coba lagi nanti." },
        { status: 429 },
      )
    }

    const parsed = forgotSchema.safeParse(await req.json())
    if (!parsed.success) {
      return NextResponse.json({ error: "Email tidak valid" }, { status: 400 })
    }

    const email = parsed.data.email.trim().toLowerCase()
    const [user] = await db
      .select({ id: profiles.id, email: profiles.email, fullName: profiles.fullName })
      .from(profiles)
      .where(eq(profiles.email, email))
      .limit(1)

    if (!user) return NextResponse.json(GENERIC_RESPONSE)

    // Asking again should retire the previous link rather than leave two live.
    await db
      .update(passwordResetTokens)
      .set({ usedAt: new Date() })
      .where(and(eq(passwordResetTokens.userId, user.id), isNull(passwordResetTokens.usedAt)))

    const token = generateResetToken()
    await db.insert(passwordResetTokens).values({
      userId: user.id,
      tokenHash: hashResetToken(token),
      expiresAt: new Date(Date.now() + RESET_TOKEN_TTL_MS),
    })

    const resetUrl = `${SITE_URL}/atur-ulang-password?token=${token}`
    const result = await sendMail(
      [user.email],
      buildPasswordResetEmail({ name: user.fullName, resetUrl }),
    )

    // Without a mail provider the flow would be untestable, so the link goes to
    // the server log instead. Never in the response — that would hand the token
    // to whoever asked, account owner or not.
    if (!result.sent) {
      console.warn(`[forgot-password] mail not sent (${result.reason}); link: ${resetUrl}`)
    }

    return NextResponse.json(GENERIC_RESPONSE)
  } catch (error) {
    console.error("[POST /api/auth/forgot-password]", error)
    return NextResponse.json({ error: "Terjadi kesalahan pada server" }, { status: 500 })
  }
}
