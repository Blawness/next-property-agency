import Link from "next/link"
import { AtSign, Mail, MapPin, MessageCircle } from "lucide-react"
import BrandMark from "@/components/BrandMark"
import { BRAND } from "@/lib/brand"

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer id="kontak" className="bg-primary text-primary-foreground">
      <div
        aria-hidden
        className="h-px"
        style={{
          background:
            "linear-gradient(90deg, transparent, oklch(0.72 0.09 78 / 0.55), transparent)",
        }}
      />
      <div className="container mx-auto px-4 py-14 sm:px-6">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <Link href="/" className="mb-4 inline-flex">
              <BrandMark size="md" inverted />
            </Link>
            <p className="max-w-xs text-sm leading-relaxed text-primary-foreground/70">
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
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-primary-foreground/20 text-primary-foreground/70 transition-colors hover:border-gold hover:text-gold"
                >
                  <Icon size={15} />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h3 className="mb-4 text-[11px] font-semibold uppercase tracking-[0.2em] text-primary-foreground">
              Jelajahi
            </h3>
            <ul className="space-y-2.5">
              {BRAND.footer.explore.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-primary-foreground/70 transition-colors hover:text-gold"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-[11px] font-semibold uppercase tracking-[0.2em] text-primary-foreground">
              Perusahaan
            </h3>
            <ul className="space-y-2.5">
              {BRAND.footer.company.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-primary-foreground/70 transition-colors hover:text-gold"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-[11px] font-semibold uppercase tracking-[0.2em] text-primary-foreground">
              Kontak
            </h3>
            <ul className="space-y-3 text-sm text-primary-foreground/70">
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

        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-primary-foreground/15 pt-6 sm:flex-row">
          <p className="text-xs text-primary-foreground/60">
            &copy; {year} {BRAND.name}. All rights reserved.
          </p>
          <p className="text-[10px] uppercase tracking-[0.2em] text-primary-foreground/50">
            {BRAND.tagline}
          </p>
        </div>
      </div>
    </footer>
  )
}
