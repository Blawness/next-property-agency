"use client"

import Link from "next/link"
import Image from "next/image"
import { useSession, signOut } from "next-auth/react"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet"
import { PlusCircle, ChevronDown, Menu } from "lucide-react"
import { BRAND } from "@/lib/brand"
import { cn } from "@/lib/utils"

const NAV_LINKS = [
  { href: "/#home",    label: "Home",       id: "home" },
  { href: "/#about",   label: "About us",   id: "about" },
  { href: "/#how",     label: "How we work", id: "how" },
  { href: "/properti", label: "Listings",   id: "listings" },
  { href: "/#contact", label: "Contacts",   id: "contact" },
]

const HOME_SECTIONS = ["home", "about", "how", "contact"]

function useActiveSection() {
  const [active, setActive] = useState<string | null>(null)

  useEffect(() => {
    if (typeof window === "undefined") return
    if (window.location.pathname !== "/") return

    const elements = HOME_SECTIONS
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null)

    if (elements.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)
        if (visible[0]) setActive(visible[0].target.id)
      },
      { rootMargin: "-30% 0px -55% 0px", threshold: [0, 0.25, 0.5, 0.75, 1] },
    )

    elements.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  return active
}

export default function Navbar() {
  const { data: session } = useSession()
  const pathname = usePathname()
  const activeSection = useActiveSection()
  const [mobileOpen, setMobileOpen] = useState(false)

  if (pathname.startsWith("/admin")) return null

  const isLinkActive = (id: string) => {
    if (pathname.startsWith("/admin")) return false
    if (id === "listings") return pathname.startsWith("/properti") || pathname.startsWith("/peta")
    // The remaining links point at homepage sections, so they can only be
    // active on the homepage itself; "home" stands in until the observer
    // reports a section.
    if (pathname !== "/") return false
    return activeSection ? activeSection === id : id === "home"
  }

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background">
      <nav className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6">
        <Link href="/" className="shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/mockup-assets/logo web tap catalog.png"
            alt={BRAND.name}
            style={{ display: "block", width: 154, height: 48 }}
          />
        </Link>

        <nav
          aria-label="Primary"
          className="hidden items-center gap-7 text-[15px] font-medium lg:flex xl:gap-10 xl:text-[18px] 2xl:gap-[58px] 2xl:text-[21px]"
        >
          {NAV_LINKS.map(({ href, label, id }) => {
            const active = isLinkActive(id)
            return (
              <a
                key={id}
                href={href}
                data-nav={id}
                className={cn(
                  "whitespace-nowrap transition-colors",
                  active
                    ? "text-primary font-bold"
                    : "text-primary/45 hover:text-primary",
                )}
              >
                {label}
              </a>
            )
          })}
        </nav>

        <div className="flex items-center gap-1 shrink-0">
          {session ? (
            <>
              {session.user.role === "admin" ? (
                <Link
                  href="/admin"
                  className="hidden sm:flex items-center gap-1.5 rounded-xl bg-primary px-3.5 py-2 text-[12px] font-semibold tracking-wide text-primary-foreground transition-colors hover:bg-primary/90"
                >
                  <PlusCircle size={13} />
                  Dashboard
                </Link>
              ) : null}

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 hover:bg-muted transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring">
                    <div className="h-7 w-7 rounded-full bg-secondary border-2 border-border flex items-center justify-center shrink-0 overflow-hidden">
                      {session.user.image ? (
                        <Image
                          src={session.user.image}
                          alt=""
                          width={28}
                          height={28}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span className="text-[11px] font-bold text-primary">
                          {session.user.name?.[0]?.toUpperCase() ?? "U"}
                        </span>
                      )}
                    </div>
                    <ChevronDown size={12} className="text-foreground/40 hidden sm:block" />
                  </button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end" className="w-52">
                  <div className="px-3 py-2.5 border-b border-border">
                    <p className="text-[13px] font-semibold truncate leading-tight">
                      {session.user.name ?? "Pengguna"}
                    </p>
                    <p className="text-[11px] text-muted-foreground truncate mt-0.5">
                      {session.user.email}
                    </p>
                  </div>

                  <DropdownMenuItem asChild className="mt-1 cursor-pointer">
                    <Link href="/profil">Profil &amp; Favorit</Link>
                  </DropdownMenuItem>

                  {session.user.role === "admin" && (
                    <DropdownMenuItem asChild className="sm:hidden cursor-pointer">
                      <Link href="/admin">Dashboard</Link>
                    </DropdownMenuItem>
                  )}

                  <DropdownMenuSeparator />

                  <DropdownMenuItem
                    onClick={() => signOut()}
                    className="text-destructive focus:text-destructive cursor-pointer"
                  >
                    Keluar
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <Link
              href="/masuk"
              className="hidden sm:flex items-center gap-1.5 rounded-xl border border-primary px-3.5 py-2 text-[12px] font-semibold tracking-wide text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
            >
              Masuk
            </Link>
          )}

          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <button
                type="button"
                aria-label="Buka menu navigasi"
                className="lg:hidden flex h-9 w-9 items-center justify-center rounded-lg text-primary hover:bg-muted transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <Menu size={20} />
              </button>
            </SheetTrigger>
            <SheetContent
              side="right"
              showCloseButton={false}
              className="w-[300px] sm:w-[340px] p-0"
            >
              <SheetTitle className="sr-only">Menu Navigasi</SheetTitle>
              <div className="flex items-center justify-between border-b border-border px-5 h-16">
                <span className="font-sans text-[15px] font-bold text-primary">
                  {BRAND.name}
                </span>
                <SheetClose asChild>
                  <button
                    type="button"
                    aria-label="Tutup menu"
                    className="flex h-9 w-9 items-center justify-center rounded-lg text-foreground/60 hover:bg-muted transition-colors"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M18 6L6 18M6 6l12 12" />
                    </svg>
                  </button>
                </SheetClose>
              </div>
              <nav aria-label="Mobile navigation" className="flex flex-col p-2">
                {NAV_LINKS.map(({ href, label, id }) => {
                  const active = isLinkActive(id)
                  return (
                    <a
                      key={id}
                      href={href}
                      onClick={() => setMobileOpen(false)}
                      className={cn(
                        "flex items-center justify-between rounded-xl px-4 py-3.5 text-[17px] font-medium transition-colors",
                        active
                          ? "bg-primary/8 text-primary font-bold"
                          : "text-foreground/80 hover:bg-muted",
                      )}
                    >
                      <span>{label}</span>
                      {active && (
                        <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-primary" />
                      )}
                    </a>
                  )
                })}
              </nav>
              {!session && (
                <div className="px-3 pb-4">
                  <Link
                    href="/masuk"
                    onClick={() => setMobileOpen(false)}
                    className="flex w-full items-center justify-center rounded-xl border border-primary px-4 py-3 text-[14px] font-semibold text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
                  >
                    Masuk
                  </Link>
                </div>
              )}
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </header>
  )
}
