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
import BrandMark from "@/components/BrandMark"
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
          className="lg:hidden flex h-9 w-9 items-center justify-center rounded-full text-accent transition-colors hover:bg-muted outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Menu size={20} />
        </button>
      </SheetTrigger>

      <SheetContent side="right" showCloseButton={false} className="w-[300px] sm:w-[340px] p-0">
        <SheetTitle className="sr-only">Menu Navigasi</SheetTitle>

        <div className="flex items-center justify-between border-b border-border px-5 h-16">
          <BrandMark size="sm" />
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
                  "flex items-center justify-between rounded-xl px-3 py-3 text-base transition-colors",
                  active ? "bg-primary/10 font-bold text-primary" : "font-medium text-foreground/75 hover:bg-muted",
                )}
              >
                {label}
              </NavLink>
            )
          })}
        </nav>

        {!session && (
          <div className="px-5 pb-6">
            <Link
              href="/masuk"
              onClick={close}
              className="flex h-12 w-full items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Masuk
            </Link>
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}
