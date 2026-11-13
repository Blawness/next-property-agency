import { NextRequest, NextResponse } from "next/server"
import { db } from "@/db"
import { profiles, properties } from "@/db/schema"
import { authAdmin, getSession } from "@/lib/auth"
import { eq } from "drizzle-orm"
import { rateLimit, getRateLimitKey } from "@/lib/rate-limit"
import { z } from "zod"
import { generateTempPassword } from "@/lib/temp-password"

const updateAgentSchema = z.object({
  name: z.string().min(2).optional(),
  phone: z.string().optional(),
  avatarUrl: z.string().url().optional().nullable(),
  title: z.string().max(80).optional().nullable(),
  bio: z.string().max(1200).optional().nullable(),
  // When true the other fields are ignored: this is the "agent cannot reach
  // their email" escape hatch, not a normal edit.
  resetPassword: z.literal(true).optional(),
})

/** The Neon Auth user behind a profile; null for a profile with no login. */
async function authUserIdOf(profileId: string): Promise<string | null> {
  const [row] = await db
    .select({ authUserId: profiles.authUserId })
    .from(profiles)
    .where(eq(profiles.id, profileId))
    .limit(1)
  return row?.authUserId ?? null
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const ip = req.headers.get("x-forwarded-for") ?? "unknown"
    const limit = await rateLimit(getRateLimitKey(ip, "agent-update"), { windowMs: 60_000, max: 30 })
    if (!limit.success) {
      return NextResponse.json({ error: "Terlalu banyak permintaan. Coba lagi nanti." }, { status: 429 })
    }

    const { id } = await params
    const body = await req.json()
    const parsed = updateAgentSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validasi gagal", details: parsed.error.flatten() },
        { status: 400 },
      )
    }

    if (parsed.data.resetPassword) {
      const authUserId = await authUserIdOf(id)
      if (!authUserId) {
        return NextResponse.json({ error: "Agen ini tidak punya akun login" }, { status: 404 })
      }
      const tempPassword = generateTempPassword()
      const { error: setError } = await authAdmin.setUserPassword({ userId: authUserId, newPassword: tempPassword })
      if (setError) {
        console.error("[PATCH /api/admin/agents] Neon Auth setUserPassword", setError)
        return NextResponse.json({ error: "Gagal mengatur ulang password" }, { status: 502 })
      }
      // Ends every session the agent had open, same as a self-service reset —
      // otherwise handing out a new password changes nothing for whoever is
      // already signed in.
      const { error: revokeError } = await authAdmin.revokeUserSessions({ userId: authUserId })
      if (revokeError) {
        console.error("[PATCH /api/admin/agents] Neon Auth revokeUserSessions", revokeError)
        return NextResponse.json({ error: "Password diganti, tapi sesi lama gagal diakhiri" }, { status: 502 })
      }

      // Shown to the admin once, never stored.
      return NextResponse.json({ ok: true, tempPassword })
    }

    const updateData: Record<string, string | null> = {}
    if (parsed.data.name !== undefined) updateData.fullName = parsed.data.name
    if (parsed.data.phone !== undefined) updateData.phone = parsed.data.phone || null
    if (parsed.data.avatarUrl !== undefined) updateData.avatarUrl = parsed.data.avatarUrl
    if (parsed.data.title !== undefined) updateData.title = parsed.data.title || null
    if (parsed.data.bio !== undefined) updateData.bio = parsed.data.bio || null

    if (Object.keys(updateData).length > 0) {
      await db.update(profiles).set(updateData).where(eq(profiles.id, id))
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("[PATCH /api/admin/agents]", error)
    return NextResponse.json({ error: "Terjadi kesalahan pada server" }, { status: 500 })
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const ip = _req.headers.get("x-forwarded-for") ?? "unknown"
    const limit = await rateLimit(getRateLimitKey(ip, "agent-delete"), { windowMs: 60_000, max: 30 })
    if (!limit.success) {
      return NextResponse.json({ error: "Terlalu banyak permintaan. Coba lagi nanti." }, { status: 429 })
    }

    const { id } = await params

    // The login goes first: removed after the profile, a failure would leave an
    // account that signs in to a freshly made buyer profile.
    const authUserId = await authUserIdOf(id)
    if (authUserId) {
      const { error: removeError } = await authAdmin.removeUser({ userId: authUserId })
      if (removeError) {
        console.error("[DELETE /api/admin/agents] Neon Auth removeUser", removeError)
        return NextResponse.json({ error: "Gagal menghapus akun login agen" }, { status: 502 })
      }
    }

    await db
      .update(properties)
      .set({ agentId: session.user.id })
      .where(eq(properties.agentId, id))

    await db.delete(profiles).where(eq(profiles.id, id))

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("[DELETE /api/admin/agents]", error)
    return NextResponse.json({ error: "Terjadi kesalahan pada server" }, { status: 500 })
  }
}
