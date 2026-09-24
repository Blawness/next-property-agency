"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import BrandMark from "@/components/BrandMark"
import DesktopNav from "@/components/navbar/DesktopNav"
import MobileNav from "@/components/navbar/MobileNav"
import UserMenu from "@/components/navbar/UserMenu"
import { useActiveSection } from "@/components/navbar/useActiveSection"
import { isNavLinkActive } from "@/components/navbar/nav-links"
import { useOverHero } from "@/components/navbar/useOverHero"
import { BRAND } from "@/lib/brand"
import { cn } from "@/lib/utils"

export default function Navbar() {
  const pathname = usePathname()
  const activeSection = useActiveSection()
  const overHero = useOverHero(pathname)

  if (pathname.startsWith("/admin")) return null

  const isActive = (id: string) => isNavLinkActive(id, pathname, activeSection)

  return (
    <header
      className={cn(
        "sticky top-0 z-40 border-b transition-colors duration-500",
        overHero ? "border-white/15 bg-transparent" : "border-border bg-background/95 backdrop-blur",
      )}
    >
      <nav className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6">
        <Link href="/" className="shrink-0" aria-label={BRAND.name}>
          <BrandMark size="md" inverted={overHero} />
        </Link>

        <DesktopNav isActive={isActive} light={overHero} />

        <div className="flex items-center gap-1 shrink-0">
          <UserMenu light={overHero} />
          <MobileNav isActive={isActive} light={overHero} />
        </div>
      </nav>
    </header>
  )
}
