import { NextRequest, NextResponse } from "next/server"
import { db } from "@/db"
import { profiles, passwordResetTokens } from "@/db/schema"
import { eq } from "drizzle-orm"
import { rateLimit, getRateLimitKey } from "@/lib/rate-limit"
import { hashResetToken, isTokenUsable } from "@/lib/password-reset"
import bcrypt from "bcryptjs"
import { z } from "zod"

const resetSchema = z.object({
  token: z.string().min(32).max(128),
  // Same rule as registration — a reset must not be a way around it.
  password: z.string().min(8, "Password minimal 8 karakter"),
})

/**
 * One message for every way a token can fail. Distinguishing "expired" from
 * "never existed" tells an attacker which guesses were close.
 */
const INVALID = "Tautan tidak berlaku atau sudah kedaluwarsa. Silakan minta tautan baru."

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for") ?? "unknown"
    const limit = await rateLimit(getRateLimitKey(ip, "reset-password"), {
      windowMs: 15 * 60 * 1000,
      max: 10,
    })
    if (!limit.success) {
      return NextResponse.json(
        { error: "Terlalu banyak permintaan. Coba lagi nanti." },
        { status: 429 },
      )
    }

    const parsed = resetSchema.safeParse(await req.json())
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Data tidak valid" },
        { status: 400 },
      )
    }

    const { token, password } = parsed.data

    const [row] = await db
      .select({
        tokenId: passwordResetTokens.id,
        userId: passwordResetTokens.userId,
        expiresAt: passwordResetTokens.expiresAt,
        usedAt: passwordResetTokens.usedAt,
      })
      .from(passwordResetTokens)
      .innerJoin(profiles, eq(profiles.id, passwordResetTokens.userId))
      .where(eq(passwordResetTokens.tokenHash, hashResetToken(token)))
      .limit(1)

    if (!isTokenUsable(row ?? null)) {
      return NextResponse.json({ error: INVALID }, { status: 400 })
    }

    const now = new Date()
    const passwordHash = await bcrypt.hash(password, 10)

    // passwordChangedAt is what actually ends other sessions: the JWT callback
    // rejects any token issued before it. Without this, an intruder who is
    // already signed in keeps their session through the reset.
    await db
      .update(profiles)
      .set({ passwordHash, passwordChangedAt: now })
      .where(eq(profiles.id, row.userId))

    await db
      .update(passwordResetTokens)
      .set({ usedAt: now })
      .where(eq(passwordResetTokens.id, row.tokenId))

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("[POST /api/auth/reset-password]", error)
    return NextResponse.json({ error: "Terjadi kesalahan pada server" }, { status: 500 })
  }
}
