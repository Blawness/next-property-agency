import { BRAND } from "@/lib/brand"
import { formatPriceFull } from "@/lib/constants"

export interface ShareTextInput {
  title: string
  price: string
  listingType: string
  /** Absolute URL of the listing. */
  url: string
}

/**
 * The message a visitor forwards to someone else — distinct from
 * `buildWhatsAppLink`, which is an enquiry addressed *to* an agent. This has no
 * recipient: it is a listing card in plain text, and the link goes last so it
 * is the last thing the reader sees before tapping.
 */
export function buildShareText({ title, price, listingType, url }: ShareTextInput): string {
  const formatted = formatPriceFull(price, listingType)
  return [`${title} — ${formatted}`, "", `Lihat di ${BRAND.name}:`, url].join("\n")
}

/** wa.me with no number, which makes WhatsApp open its contact picker. */
export function buildWhatsAppShareLink(text: string): string {
  return `https://wa.me/?text=${encodeURIComponent(text)}`
}
