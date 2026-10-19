import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import NavLink from "@/components/navbar/NavLink"
import { BRAND } from "@/lib/brand"

/** A navbar destination whose content is not written yet, with a way on. */
export default function ComingSoon({ title, body }: { title: string; body: string }) {
  const { comingSoon } = BRAND
  return (
    <section className="container mx-auto flex min-h-[60vh] flex-col items-start justify-center px-4 py-16">
      <Badge className="h-7 bg-primary/10 px-3 text-[13px] font-semibold text-primary">{comingSoon.badge}</Badge>
      <h1 className="mt-4 text-3xl font-bold tracking-tight text-accent sm:text-4xl">{title}</h1>
      <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-foreground/80">{body}</p>
      <p className="mt-1 max-w-xl text-[15px] leading-relaxed text-muted-foreground">{comingSoon.followUp}</p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Button asChild className="h-11 px-6 font-semibold">
          <Link href="/properti">{comingSoon.catalogCta}</Link>
        </Button>
        <Button asChild variant="outline" className="h-11 px-6 font-semibold">
          {/* NavLink picks the plain anchor a hash link needs. */}
          <NavLink href="/#contact">{comingSoon.contactCta}</NavLink>
        </Button>
      </div>
    </section>
  )
}
