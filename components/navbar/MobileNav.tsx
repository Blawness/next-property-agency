"use client"

import { useState } from "react"
import Link from "next/link"
import { useSession } from "next-auth/react"
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet"
import { Menu, X } from "lucide-react"
import NavLink from "@/components/navbar/NavLink"
import { NAV_LINKS } from "@/components/navbar/nav-links"
import { BRAND } from "@/lib/brand"
import { cn } from "@/lib/utils"

export default function MobileNav({
  isActive,
  light = false,
}: {
  isActive: (id: string) => boolean
  light?: boolean
}) {
  const { data: session } = useSession()
  const [open, setOpen] = useState(false)
  const close = () => setOpen(false)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button
          type="button"
          aria-label="Buka menu navigasi"
          className={cn(
            "lg:hidden flex h-9 w-9 items-center justify-center rounded-lg transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring",
            light ? "text-white hover:bg-white/10" : "text-primary hover:bg-muted",
          )}
        >
          <Menu size={20} />
        </button>
      </SheetTrigger>

      <SheetContent side="right" showCloseButton={false} className="w-[300px] sm:w-[340px] p-0">
        <SheetTitle className="sr-only">Menu Navigasi</SheetTitle>

        <div className="flex items-center justify-between border-b border-border px-5 h-16">
          <span className="text-[11px] font-semibold uppercase tracking-[0.3em] text-foreground">{BRAND.name}</span>
          <SheetClose asChild>
            <button
              type="button"
              aria-label="Tutup menu"
              className="flex h-9 w-9 items-center justify-center rounded-lg text-foreground/60 hover:bg-muted transition-colors"
            >
              <X size={18} />
            </button>
          </SheetClose>
        </div>

        <nav aria-label="Mobile navigation" className="flex flex-col px-5 py-4">
          {NAV_LINKS.map(({ href, label, id }) => {
            const active = isActive(id)
            return (
              <NavLink
                key={id}
                href={href}
                id={id}
                onNavigate={close}
                className={cn(
                  "flex items-center justify-between border-b border-border py-4 font-serif text-[26px] font-light transition-colors",
                  active ? "text-foreground font-normal" : "text-foreground/60 hover:text-foreground",
                )}
              >
                <span className={active ? "italic" : undefined}>{label}</span>
                {active && <span aria-hidden className="h-px w-6 bg-gold" />}
              </NavLink>
            )
          })}
        </nav>

        {!session && (
          <div className="px-5 pb-6">
            <Link
              href="/masuk"
              onClick={close}
              className="flex h-12 w-full items-center justify-center border border-foreground/30 text-[11px] font-semibold uppercase tracking-[0.24em] text-foreground transition-colors hover:bg-foreground hover:text-background"
            >
              Masuk
            </Link>
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}
