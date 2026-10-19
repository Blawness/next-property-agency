"use client"

import { useState } from "react"
import {
  Briefcase,
  Camera,
  Handshake,
  Info,
  LayoutGrid,
  Network,
  Phone,
  Wallet,
  type LucideIcon,
} from "lucide-react"
import NavLink from "@/components/navbar/NavLink"
import { NAV_GROUPS } from "@/components/navbar/nav-links"
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu"
import { cn } from "@/lib/utils"

const ICONS: Record<string, LucideIcon> = {
  Briefcase,
  Camera,
  Handshake,
  Info,
  LayoutGrid,
  Network,
  Phone,
  Wallet,
}

/**
 * The three dropdowns, on shadcn's NavigationMenu (Radix), laid out the way
 * Rukita's work:
 *
 * - Each trigger is the full height of the bar and its panel starts right at
 *   the bar's bottom edge. A gap between the two (shadcn's default mt-1.5)
 *   meant the pointer left the trigger before reaching the panel, and Radix
 *   closed it on the way down.
 * - Clicking an open trigger leaves it open. Radix toggles on click, so a
 *   hover-opened menu closed on the click most people make next. Escape, an
 *   outside click and moving away still close it.
 * - The page behind an open menu is dimmed — no blur, which measured as
 *   dropped frames over the homepage photographs.
 */
export default function DesktopNav({
  activeGroup,
  isItemActive,
  light = false,
}: {
  activeGroup: string | null
  isItemActive: (href: string) => boolean
  /** White type, for when the bar sits transparent over the homepage hero */
  light?: boolean
}) {
  const [open, setOpen] = useState("")

  return (
    <>
      <NavigationMenu
        viewport={false}
        value={open}
        onValueChange={setOpen}
        aria-label="Primary"
        className="mr-auto hidden h-16 lg:flex"
      >
        <NavigationMenuList className="h-16 gap-1">
          {NAV_GROUPS.map((group) => {
            const current = activeGroup === group.id
            return (
              <NavigationMenuItem key={group.id} value={group.id} className="h-16">
                <NavigationMenuTrigger
                  data-nav={group.id}
                  onClick={(event) => {
                    // Radix skips its own toggle when the click is prevented.
                    if (open === group.id) event.preventDefault()
                  }}
                  className={cn(
                    // font-bold on the active group is what Navbar.test reads.
                    "h-16 cursor-pointer rounded-none bg-transparent px-3 text-[15px] underline-offset-[6px]",
                    "hover:bg-transparent hover:underline focus:bg-transparent focus-visible:bg-transparent",
                    "data-open:bg-transparent data-open:underline data-open:hover:bg-transparent data-open:focus:bg-transparent",
                    light ? "text-white hover:text-white" : "text-foreground/80 hover:text-foreground",
                    current ? "font-bold underline decoration-2" : "font-medium",
                    current && !light && "text-primary hover:text-primary",
                  )}
                >
                  {group.label}
                </NavigationMenuTrigger>
                <NavigationMenuContent className="z-50 group-data-[viewport=false]/navigation-menu:mt-0 group-data-[viewport=false]/navigation-menu:rounded-xl group-data-[viewport=false]/navigation-menu:shadow-xl">
                  <ul className="w-[30rem] p-2">
                    {group.items.map((item) => {
                      const active = isItemActive(item.href)
                      const Icon = ICONS[item.icon] ?? LayoutGrid
                      return (
                        <li key={item.href}>
                          <NavigationMenuLink asChild active={active}>
                            <NavLink
                              href={item.href}
                              aria-current={active ? "page" : undefined}
                              className="flex items-start gap-4 rounded-lg p-3"
                            >
                              <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted text-accent">
                                <Icon className="size-5" aria-hidden />
                              </span>
                              <span className="flex flex-col gap-0.5">
                                <span className={cn("text-[15px] font-semibold", active ? "text-primary" : "text-foreground")}>
                                  {item.label}
                                </span>
                                <span className="text-[13px] text-muted-foreground">{item.description}</span>
                              </span>
                            </NavLink>
                          </NavigationMenuLink>
                        </li>
                      )
                    })}
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>
            )
          })}
        </NavigationMenuList>
      </NavigationMenu>
      {open && (
        <div
          data-nav-overlay
          aria-hidden
          className="pointer-events-none fixed inset-x-0 bottom-0 top-16 z-30 hidden bg-black/30 lg:block"
        />
      )}
    </>
  )
}
