import { NextRequest, NextResponse } from "next/server"
import { db } from "@/db"
import { leads, properties, profiles } from "@/db/schema"
import { eq } from "drizzle-orm"
import { rateLimit, getRateLimitKey } from "@/lib/rate-limit"
import { normalizeWhatsAppNumber } from "@/lib/whatsapp"
import { buildLeadEmail, leadRecipients, sendMail } from "@/lib/notify"
import { BRAND } from "@/lib/brand"
import { SITE_URL } from "@/lib/constants"
import { z } from "zod"

const leadSchema = z.object({
  name: z.string().min(2).max(100),
  // Phone is the contact that matters here, so it is validated the same way the
  // WhatsApp links are: a number that cannot be dialled is rejected at the door
  // rather than discovered when an agent tries to follow up.
  phone: z
    .string()
    .min(1)
    .max(30)
    .refine((v) => normalizeWhatsAppNumber(v) !== null, {
      message: "Nomor telepon tidak valid",
    }),
  email: z.string().email().optional().or(z.literal("")),
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

    const { name, phone, email, message, propertyId } = parsed.data

    // One join gets both the listing's title for the email and the agent to
    // send it to; without a propertyId the lead is a general enquiry.
    let propertyTitle: string | null = null
    let agentEmail: string | null = null
    if (propertyId) {
      const [row] = await db
        .select({ title: properties.title, agentEmail: profiles.email })
        .from(properties)
        .leftJoin(profiles, eq(properties.agentId, profiles.id))
        .where(eq(properties.id, propertyId))
        .limit(1)
      propertyTitle = row?.title ?? null
      agentEmail = row?.agentEmail ?? null
    }

    await db.insert(leads).values({
      name,
      phone,
      email: email || null,
      message,
      propertyId: propertyId || null,
      status: "new",
    })

    // The lead is committed. Notification is best-effort from here: failing the
    // request now would only make the visitor submit again and duplicate it.
    try {
      const recipients = leadRecipients({ agentEmail, officeEmail: BRAND.contact.email })
      await sendMail(
        recipients,
        buildLeadEmail({
          name,
          phone,
          email: email || null,
          message,
          propertyTitle,
          propertyUrl: propertyId ? `${SITE_URL}/properti/${propertyId}` : null,
        }),
      )
    } catch (err) {
      console.error("[POST /api/leads] lead saved but notification failed:", err)
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("[POST /api/leads]", error)
    return NextResponse.json({ error: "Terjadi kesalahan pada server" }, { status: 500 })
  }
}
