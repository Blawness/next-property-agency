import Link from "next/link"
import { ArrowRight, AtSign, Globe, Mail, MapPin, MessageCircle } from "lucide-react"
import BrandMark from "@/components/BrandMark"
import { BRAND } from "@/lib/brand"

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="bg-accent text-accent-foreground">
      <div className="container mx-auto px-4 pt-12 pb-8">
        <div className="mb-10 flex flex-col gap-4 border-b border-accent-foreground/15 pb-10 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xl font-bold sm:text-2xl">
            {BRAND.footer.closing.lead} {BRAND.footer.closing.trail}
          </p>
          <Link
            href="/properti"
            className="inline-flex h-11 items-center gap-2 self-start rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 sm:self-auto"
          >
            {BRAND.footer.closing.cta}
            <ArrowRight size={15} aria-hidden />
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
                  className="flex h-9 w-9 rounded-full items-center justify-center border border-accent-foreground/20 text-accent-foreground/70 transition-colors hover:border-gold hover:text-gold"
                >
                  <Icon size={15} />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold text-accent-foreground">
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
            <h3 className="mb-4 text-sm font-semibold text-accent-foreground">
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
            <h3 className="mb-4 text-sm font-semibold text-accent-foreground">
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
              <li className="flex min-w-0 items-center gap-2.5">
                <Globe size={14} className="shrink-0 text-gold" />
                <a href={`https://${BRAND.contact.website}`} className="min-w-0 break-all hover:text-gold">
                  {BRAND.contact.website}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-accent-foreground/15 pt-6 sm:flex-row">
          <p className="text-xs text-accent-foreground/60">
            &copy; {year} {BRAND.name}. Hak cipta dilindungi.
          </p>
          <p className="text-xs text-accent-foreground/50">
            {BRAND.tagline}
          </p>
        </div>
      </div>
    </footer>
  )
}
