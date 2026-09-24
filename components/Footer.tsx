import Link from "next/link"
import { ArrowRight, AtSign, Mail, MapPin, MessageCircle } from "lucide-react"
import BrandMark from "@/components/BrandMark"
import { BRAND } from "@/lib/brand"

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer id="kontak" data-footer className="bg-accent text-accent-foreground">
      <div
        aria-hidden
        className="h-px"
        style={{
          background:
            "linear-gradient(90deg, transparent, oklch(0.72 0.09 78 / 0.55), transparent)",
        }}
      />
      <div data-footer-content className="mx-auto max-w-[1440px] px-[clamp(1.25rem,5vw,4.5rem)] pt-[clamp(4rem,8vw,6rem)] pb-10">
        <div className="mb-14 flex flex-col gap-8 border-b border-accent-foreground/15 pb-14 lg:flex-row lg:items-end lg:justify-between">
          <p data-split className="m-0 font-serif text-[clamp(2.5rem,5.5vw,5rem)] font-light leading-[1] tracking-[-0.01em]">
            {BRAND.footer.closing.lead}{" "}
            <span className="italic text-gold">{BRAND.footer.closing.trail}</span>
          </p>
          <Link
            href="/properti"
            className="group inline-flex items-center gap-3 self-start border-b border-accent-foreground/40 pb-2 text-[11px] font-semibold uppercase tracking-[0.24em] transition-colors hover:border-gold hover:text-gold lg:self-auto"
          >
            {BRAND.footer.closing.cta}
            <ArrowRight size={15} strokeWidth={1.5} className="transition-transform duration-500 group-hover:translate-x-1" />
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <Link href="/" className="mb-4 inline-flex">
              <BrandMark size="md" inverted />
            </Link>
            <p className="max-w-xs text-sm leading-relaxed text-accent-foreground/70">
              {BRAND.footer.tagline}
            </p>
            <div className="mt-5 flex gap-2.5">
              {[
                { icon: AtSign, label: "Instagram", href: BRAND.social.instagram },
                { icon: MessageCircle, label: "WhatsApp", href: BRAND.social.whatsapp },
                { icon: Mail, label: "Email", href: `mailto:${BRAND.contact.email}` },
              ].map(({ icon: Icon, label, href }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="flex h-9 w-9 items-center justify-center border border-accent-foreground/20 text-accent-foreground/70 transition-colors hover:border-gold hover:text-gold"
                >
                  <Icon size={15} />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h3 className="mb-5 text-[10px] font-semibold uppercase tracking-[0.28em] text-gold">
              Jelajahi
            </h3>
            <ul className="space-y-2.5">
              {BRAND.footer.explore.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-accent-foreground/70 transition-colors hover:text-gold"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-5 text-[10px] font-semibold uppercase tracking-[0.28em] text-gold">
              Perusahaan
            </h3>
            <ul className="space-y-2.5">
              {BRAND.footer.company.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-accent-foreground/70 transition-colors hover:text-gold"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-5 text-[10px] font-semibold uppercase tracking-[0.28em] text-gold">
              Kontak
            </h3>
            <ul className="space-y-3 text-sm text-accent-foreground/70">
              <li className="flex items-start gap-2.5">
                <MapPin size={14} className="mt-0.5 shrink-0 text-gold" />
                <span className="whitespace-pre-line leading-[1.5]">
                  {BRAND.contact.address}
                </span>
              </li>
              <li className="flex min-w-0 items-center gap-2.5">
                <Mail size={14} className="shrink-0 text-gold" />
                <a href={`mailto:${BRAND.contact.email}`} className="min-w-0 break-all hover:text-gold">
                  {BRAND.contact.email}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-accent-foreground/15 pt-6 sm:flex-row">
          <p className="text-xs text-accent-foreground/60">
            &copy; {year} {BRAND.name}. Hak cipta dilindungi.
          </p>
          <p className="text-[10px] uppercase tracking-[0.2em] text-accent-foreground/50">
            {BRAND.tagline}
          </p>
        </div>
      </div>
    </footer>
  )
}
