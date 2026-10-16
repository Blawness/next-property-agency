"use client"

import NavLink from "@/components/navbar/NavLink"
import { NAV_LINKS } from "@/components/navbar/nav-links"
import { cn } from "@/lib/utils"

export default function DesktopNav({ isActive }: { isActive: (id: string) => boolean }) {
  return (
    <nav aria-label="Primary" className="mr-auto hidden items-center gap-1 lg:flex">
      {NAV_LINKS.map(({ href, label, id }) => (
        <NavLink
          key={id}
          href={href}
          id={id}
          className={cn(
            // font-bold on the active item is what Navbar.test reads.
            "whitespace-nowrap rounded-full px-4 py-2 text-sm transition-colors",
            isActive(id)
              ? "bg-primary/10 font-bold text-primary"
              : "font-medium text-foreground/70 hover:bg-muted hover:text-foreground",
          )}
        >
          {label}
        </NavLink>
      ))}
    </nav>
  )
}
