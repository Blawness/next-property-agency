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
import { NAV_GROUPS } from "@/components/navbar/nav-links"
import BrandMark from "@/components/BrandMark"
import { cn } from "@/lib/utils"

export default function MobileNav({ isItemActive }: { isItemActive: (href: string) => boolean }) {
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

        <nav aria-label="Mobile navigation" className="flex flex-col gap-5 overflow-y-auto px-5 py-5">
          {NAV_GROUPS.map((group) => (
            <section key={group.id}>
              <h2 className="mb-1 px-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {group.label}
              </h2>
              <ul>
                {group.items.map((item) => {
                  const active = isItemActive(item.href)
                  return (
                    <li key={item.href}>
                      <NavLink
                        href={item.href}
                        onNavigate={close}
                        aria-current={active ? "page" : undefined}
                        className={cn(
                          "flex items-center rounded-xl px-3 py-2.5 text-base transition-colors",
                          active ? "bg-primary/10 font-bold text-primary" : "font-medium text-foreground/80 hover:bg-muted",
                        )}
                      >
                        {item.label}
                      </NavLink>
                    </li>
                  )
                })}
              </ul>
            </section>
          ))}
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
