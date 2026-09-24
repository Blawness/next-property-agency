"use client"

import NavLink from "@/components/navbar/NavLink"
import { NAV_LINKS } from "@/components/navbar/nav-links"
import { cn } from "@/lib/utils"

export default function DesktopNav({
  isActive,
  light = false,
}: {
  isActive: (id: string) => boolean
  /** White type, for when the bar sits transparent over the homepage hero */
  light?: boolean
}) {
  return (
    <nav
      aria-label="Primary"
      className="hidden items-center gap-8 text-[11px] uppercase tracking-[0.24em] lg:flex xl:gap-11"
    >
      {NAV_LINKS.map(({ href, label, id }) => (
        <NavLink
          key={id}
          href={href}
          id={id}
          className={cn(
            // The gold rule under the active item does the work the old
            // colour jump did; the weight change stays for the Navbar tests.
            "relative whitespace-nowrap py-2 transition-colors duration-300",
            "after:absolute after:inset-x-0 after:bottom-0 after:h-px after:origin-left after:bg-gold after:transition-transform after:duration-500",
            isActive(id) ? "font-bold after:scale-x-100" : "font-medium after:scale-x-0 hover:after:scale-x-100",
            light
              ? isActive(id)
                ? "text-white"
                : "text-white/70 hover:text-white"
              : isActive(id)
                ? "text-foreground"
                : "text-foreground/55 hover:text-foreground",
          )}
        >
          {label}
        </NavLink>
      ))}
    </nav>
  )
}
