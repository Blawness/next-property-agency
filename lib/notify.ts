import { BRAND } from "@/lib/brand"
import { normalizeWhatsAppNumber } from "@/lib/whatsapp"

export interface LeadRecipientInput {
  /** Email of the agent holding the listing, when it has one. */
  agentEmail: string | null | undefined
  /** Office inbox — `BRAND.contact.email` in practice. */
  officeEmail: string | null | undefined
}

/**
 * Who hears about a new lead: the listing's agent and the office, de-duplicated
 * so an agent who *is* the office inbox does not get two copies. Empty when
 * neither address is configured, which the caller treats as "nothing to send".
 */
export function leadRecipients({ agentEmail, officeEmail }: LeadRecipientInput): string[] {
  const seen = new Set<string>()
  const out: string[] = []

  for (const raw of [agentEmail, officeEmail]) {
    const address = raw?.trim()
    if (!address) continue
    const key = address.toLowerCase()
    if (seen.has(key)) continue
    seen.add(key)
    out.push(key)
  }

  return out
}

export interface LeadEmailInput {
  name: string
  phone: string
  email: string | null
  message: string
  propertyTitle: string | null
  propertyUrl: string | null
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
}

/**
 * The notification an agent actually acts on. Every field a follow-up needs is
 * in the body — nobody should have to open the dashboard to find the number.
 * Lead text is visitor-supplied, so it is escaped before it reaches the HTML.
 */
export function buildLeadEmail(lead: LeadEmailInput): {
  subject: string
  text: string
  html: string
} {
  const about = lead.propertyTitle ? ` — ${lead.propertyTitle}` : ""
  const subject = `Lead baru dari ${lead.name}${about}`

  const lines = [
    `Nama    : ${lead.name}`,
    `Telepon : ${lead.phone}`,
    ...(lead.email ? [`Email   : ${lead.email}`] : []),
    ...(lead.propertyTitle ? [`Properti: ${lead.propertyTitle}`] : []),
    ...(lead.propertyUrl ? [`Link    : ${lead.propertyUrl}`] : []),
    "",
    "Pesan:",
    lead.message,
    "",
    `Dikirim lewat ${BRAND.name}.`,
  ]

  const whatsappNumber = normalizeWhatsAppNumber(lead.phone)
  const htmlRows = [
    ["Nama", escapeHtml(lead.name)],
    [
      "Telepon",
      whatsappNumber
        ? `<a href="https://wa.me/${whatsappNumber}">${escapeHtml(lead.phone)}</a>`
        : escapeHtml(lead.phone),
    ],
    ...(lead.email
      ? [["Email", `<a href="mailto:${escapeHtml(lead.email)}">${escapeHtml(lead.email)}</a>`]]
      : []),
    ...(lead.propertyTitle
      ? [
          [
            "Properti",
            lead.propertyUrl
              ? `<a href="${escapeHtml(lead.propertyUrl)}">${escapeHtml(lead.propertyTitle)}</a>`
              : escapeHtml(lead.propertyTitle),
          ],
        ]
      : []),
  ]

  const html = `<div style="font-family:system-ui,sans-serif;font-size:15px;line-height:1.6;color:#1B1B1B">
  <h2 style="margin:0 0 16px;font-size:18px">Lead baru dari ${escapeHtml(lead.name)}</h2>
  <table style="border-collapse:collapse;margin-bottom:16px">
    ${htmlRows
      .map(
        ([label, value]) =>
          `<tr><td style="padding:2px 16px 2px 0;color:#6B5B4D">${label}</td><td>${value}</td></tr>`,
      )
      .join("\n    ")}
  </table>
  <p style="margin:0 0 4px;color:#6B5B4D">Pesan:</p>
  <p style="margin:0 0 16px;white-space:pre-wrap">${escapeHtml(lead.message)}</p>
  <p style="margin:0;font-size:13px;color:#6B5B4D">Dikirim lewat ${escapeHtml(BRAND.name)}.</p>
</div>`

  return { subject, text: lines.join("\n"), html }
}

/**
 * Fire-and-forget: the lead row is already committed by the time this runs, so
 * a mail failure must never surface as a failed request — the visitor would
 * just submit again and duplicate the lead. Without RESEND_API_KEY it logs and
 * returns, which is what keeps dev and tests working with no account.
 */
export async function sendLeadNotification(
  recipients: string[],
  email: { subject: string; text: string; html: string },
): Promise<{ sent: boolean; reason?: string }> {
  if (recipients.length === 0) return { sent: false, reason: "no-recipients" }

  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    console.warn(`[notify] RESEND_API_KEY unset — skipped "${email.subject}"`)
    return { sent: false, reason: "no-api-key" }
  }

  try {
    const { Resend } = await import("resend")
    const { error } = await new Resend(apiKey).emails.send({
      from: process.env.LEAD_NOTIFY_FROM ?? "onboarding@resend.dev",
      to: recipients,
      subject: email.subject,
      text: email.text,
      html: email.html,
    })

    if (error) {
      console.error("[notify] Resend rejected the lead notification:", error)
      return { sent: false, reason: "rejected" }
    }
    return { sent: true }
  } catch (err) {
    console.error("[notify] lead notification failed:", err)
    return { sent: false, reason: "threw" }
  }
}
