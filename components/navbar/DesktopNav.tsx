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
      className="hidden items-center gap-7 text-[15px] font-medium lg:flex xl:gap-10 xl:text-[18px] 2xl:gap-[58px] 2xl:text-[21px]"
    >
      {NAV_LINKS.map(({ href, label, id }) => (
        <NavLink
          key={id}
          href={href}
          id={id}
          className={cn(
            "whitespace-nowrap transition-colors",
            light
              ? isActive(id)
                ? "text-white font-bold"
                : "text-white/65 hover:text-white"
              : isActive(id)
                ? "text-primary font-bold"
                : "text-primary/45 hover:text-primary",
          )}
        >
          {label}
        </NavLink>
      ))}
    </nav>
  )
}
