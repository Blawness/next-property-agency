import { formatPriceFull } from "@/lib/constants"

/**
 * Shorter than this and wa.me will not dial it — a stray "-" or a half-typed
 * number in `profiles.phone` should hide the button, not open a dead chat.
 */
const MIN_DIALLABLE_DIGITS = 9

/**
 * wa.me wants bare international digits. Indonesian numbers reach us three
 * ways — `08xx` straight from a form, `+62 8xx` copied off a contact card, and
 * a bare `8xx` whose leading zero was trimmed somewhere upstream — so all three
 * have to land on the same `628xx`. Anything already carrying another country
 * code is passed through untouched.
 */
export function normalizeWhatsAppNumber(raw: string | null | undefined): string | null {
  if (!raw) return null

  const digits = raw.replace(/\D/g, "")
  if (!digits) return null

  const normalized = digits.startsWith("0")
    ? `62${digits.slice(1)}`
    : digits.startsWith("8")
      ? `62${digits}`
      : digits

  return normalized.length >= MIN_DIALLABLE_DIGITS ? normalized : null
}

export interface WhatsAppLinkInput {
  title: string
  price: string
  listingType: string
  /** Absolute URL of the listing. Omitted on surfaces that have no canonical link yet. */
  url?: string
  agentPhone?: string | null
  /** Office number, used only when the listing's agent has no usable one. */
  officePhone?: string | null
}

/**
 * Builds a wa.me link with the enquiry already typed out. Returns null when no
 * number is reachable so the caller can drop the button rather than render one
 * that goes nowhere.
 */
export function buildWhatsAppLink({
  title,
  price,
  listingType,
  url,
  agentPhone,
  officePhone,
}: WhatsAppLinkInput): string | null {
  const number = normalizeWhatsAppNumber(agentPhone) ?? normalizeWhatsAppNumber(officePhone)
  if (!number) return null

  const lines = [
    `Halo, saya tertarik dengan properti "${title}" (${formatPriceFull(price, listingType)}).`,
    "Bisa dibantu info lebih lanjut dan jadwal kunjungan?",
  ]
  if (url) lines.push("", url)

  return `https://wa.me/${number}?text=${encodeURIComponent(lines.join("\n"))}`
}

export interface AgentWhatsAppLinkInput {
  agentName: string
  phone: string | null | undefined
}

/**
 * The enquiry from an agent's own profile page, where there is no listing to
 * quote — a general "help me find something" rather than "tell me about this
 * one". Null when the agent has no dialable number, same as the listing link.
 */
export function buildAgentWhatsAppLink({
  agentName,
  phone,
}: AgentWhatsAppLinkInput): string | null {
  const number = normalizeWhatsAppNumber(phone)
  if (!number) return null

  const text = `Halo ${agentName}, saya sedang mencari properti dan ingin berkonsultasi. Bisa dibantu?`
  return `https://wa.me/${number}?text=${encodeURIComponent(text)}`
}
