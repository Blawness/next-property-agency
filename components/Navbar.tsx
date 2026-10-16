"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import BrandMark from "@/components/BrandMark"
import DesktopNav from "@/components/navbar/DesktopNav"
import MobileNav from "@/components/navbar/MobileNav"
import UserMenu from "@/components/navbar/UserMenu"
import { useActiveSection } from "@/components/navbar/useActiveSection"
import { isNavLinkActive } from "@/components/navbar/nav-links"
import { BRAND } from "@/lib/brand"

export default function Navbar() {
  const pathname = usePathname()
  const activeSection = useActiveSection()

  if (pathname.startsWith("/admin")) return null

  const isActive = (id: string) => isNavLinkActive(id, pathname, activeSection)

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background">
      <nav className="container mx-auto flex h-16 items-center justify-between gap-6 px-4">
        <Link href="/" className="shrink-0" aria-label={BRAND.name}>
          <BrandMark size="md" />
        </Link>

        <DesktopNav isActive={isActive} />

        <div className="flex shrink-0 items-center gap-2">
          <UserMenu />
          <MobileNav isActive={isActive} />
        </div>
      </nav>
    </header>
  )
}
