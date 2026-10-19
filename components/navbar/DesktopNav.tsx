"use client"

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

/**
 * The three dropdowns, on shadcn's NavigationMenu (Radix): hover or click
 * opens one, the keyboard moves through them, and Escape closes.
 */
export default function DesktopNav({
  activeGroup,
  isItemActive,
}: {
  activeGroup: string | null
  isItemActive: (href: string) => boolean
}) {
  return (
    <NavigationMenu viewport={false} aria-label="Primary" className="mr-auto hidden lg:flex">
      <NavigationMenuList className="gap-1">
        {NAV_GROUPS.map((group) => (
          <NavigationMenuItem key={group.id}>
            <NavigationMenuTrigger
              data-nav={group.id}
              className={cn(
                // font-bold on the active group is what Navbar.test reads.
                "rounded-full px-4",
                activeGroup === group.id
                  ? "bg-primary/10 font-bold text-primary hover:bg-primary/15"
                  : "font-medium text-foreground/70 hover:text-foreground",
              )}
            >
              {group.label}
            </NavigationMenuTrigger>
            <NavigationMenuContent>
              <ul className="w-56 p-1">
                {group.items.map((item) => {
                  const active = isItemActive(item.href)
                  return (
                    <li key={item.href}>
                      <NavigationMenuLink asChild active={active}>
                        <NavLink
                          href={item.href}
                          aria-current={active ? "page" : undefined}
                          className={cn(
                            "rounded-md px-3 py-2",
                            active ? "font-semibold text-primary" : "text-foreground",
                          )}
                        >
                          {item.label}
                        </NavLink>
                      </NavigationMenuLink>
                    </li>
                  )
                })}
              </ul>
            </NavigationMenuContent>
          </NavigationMenuItem>
        ))}
      </NavigationMenuList>
    </NavigationMenu>
  )
}
