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

export default function MobileNav({ isActive }: { isActive: (id: string) => boolean }) {
  const { data: session } = useSession()
  const [open, setOpen] = useState(false)
  const close = () => setOpen(false)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button
          type="button"
          aria-label="Buka menu navigasi"
          className="lg:hidden flex h-9 w-9 items-center justify-center rounded-lg text-primary hover:bg-muted transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Menu size={20} />
        </button>
      </SheetTrigger>

      <SheetContent side="right" showCloseButton={false} className="w-[300px] sm:w-[340px] p-0">
        <SheetTitle className="sr-only">Menu Navigasi</SheetTitle>

        <div className="flex items-center justify-between border-b border-border px-5 h-16">
          <span className="font-sans text-[15px] font-bold text-primary">{BRAND.name}</span>
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

        <nav aria-label="Mobile navigation" className="flex flex-col p-2">
          {NAV_LINKS.map(({ href, label, id }) => {
            const active = isActive(id)
            return (
              <NavLink
                key={id}
                href={href}
                id={id}
                onNavigate={close}
                className={cn(
                  "flex items-center justify-between rounded-xl px-4 py-3.5 text-[17px] font-medium transition-colors",
                  active ? "bg-primary/8 text-primary font-bold" : "text-foreground/80 hover:bg-muted",
                )}
              >
                <span>{label}</span>
                {active && <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-primary" />}
              </NavLink>
            )
          })}
        </nav>

        {!session && (
          <div className="px-3 pb-4">
            <Link
              href="/masuk"
              onClick={close}
              className="flex w-full items-center justify-center rounded-xl border border-primary px-4 py-3 text-[14px] font-semibold text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
            >
              Masuk
            </Link>
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}
