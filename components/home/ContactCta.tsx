import Link from "next/link"
import { MessageCircle } from "lucide-react"
import { BRAND } from "@/lib/brand"
import { buildAgentWhatsAppLink } from "@/lib/whatsapp"

/**
 * The homepage's closing band and the navbar's "Kontak" target. WhatsApp shows
 * only when the office number is filled in BRAND — an empty value hides it
 * rather than pointing buyers at a number nobody answers.
 */
export default function ContactCta({ whatsapp = BRAND.contact.whatsapp }: { whatsapp?: string }) {
  const { contactCta } = BRAND
  const whatsappHref = buildAgentWhatsAppLink({ agentName: BRAND.name, phone: whatsapp })

  return (
    <section id="contact" className="container mx-auto scroll-mt-20 px-4 py-12 sm:py-16">
      <div className="flex flex-col gap-6 rounded-2xl bg-accent px-6 py-10 text-accent-foreground sm:px-10 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-xl">
          <h2 className="text-2xl font-bold sm:text-3xl">{contactCta.heading}</h2>
          <p className="mt-2 text-[15px] leading-relaxed text-accent-foreground/80">{contactCta.body}</p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link
            href="/agen"
            className="inline-flex h-12 items-center justify-center rounded-full bg-primary px-7 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            {contactCta.agentsCta}
          </Link>
          {whatsappHref && (
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-accent-foreground/40 px-7 text-sm font-semibold transition-colors hover:bg-accent-foreground hover:text-accent"
            >
              <MessageCircle size={16} aria-hidden />
              {contactCta.whatsappCta}
            </a>
          )}
        </div>
      </div>
    </section>
  )
}
