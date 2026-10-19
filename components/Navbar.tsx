"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import BrandMark from "@/components/BrandMark"
import DesktopNav from "@/components/navbar/DesktopNav"
import MobileNav from "@/components/navbar/MobileNav"
import UserMenu from "@/components/navbar/UserMenu"
import { useActiveSection } from "@/components/navbar/useActiveSection"
import { activeNavGroup, isNavItemActive } from "@/components/navbar/nav-links"
import { useOverHero } from "@/components/navbar/useOverHero"
import { BRAND } from "@/lib/brand"
import { cn } from "@/lib/utils"

export default function Navbar() {
  const pathname = usePathname()
  const activeSection = useActiveSection(pathname)
  const overHero = useOverHero(pathname)

  if (pathname.startsWith("/admin")) return null

  const isItemActive = (href: string) => isNavItemActive(href, pathname, activeSection)
  const activeGroup = activeNavGroup(pathname, activeSection)

  return (
    <header
      className={cn(
        "sticky top-0 z-40 border-b transition-colors duration-300",
        overHero ? "border-transparent bg-transparent" : "border-border bg-background",
      )}
    >
      <nav className="container mx-auto flex h-16 items-center justify-between gap-6 px-4">
        <Link href="/" className="shrink-0" aria-label={BRAND.name}>
          <BrandMark size="md" inverted={overHero} />
        </Link>

        <DesktopNav activeGroup={activeGroup} isItemActive={isItemActive} light={overHero} />

        <div className="flex shrink-0 items-center gap-2">
          <UserMenu light={overHero} />
          <MobileNav isItemActive={isItemActive} light={overHero} />
        </div>
      </nav>
    </header>
  )
}
