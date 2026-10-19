import { BRAND } from "@/lib/brand"

export interface NavItem {
  label: string
  href: string
}

export interface NavGroup {
  id: string
  label: string
  items: readonly NavItem[]
}

/** The navbar's dropdowns, in order. The copy lives in BRAND.navMenu. */
export const NAV_GROUPS: readonly NavGroup[] = BRAND.navMenu

/** Sections observed on the homepage: the search hero and the contact band. */
export const HOME_SECTIONS = ["home", "contact"]

/**
 * Hash links must stay plain anchors — `<Link>` cannot scroll to a section the
 * way the browser does. Everything else is a route and should navigate on the
 * client instead of reloading the whole app shell.
 */
export function isHashLink(href: string): boolean {
  return href.startsWith("#") || href.startsWith("/#")
}

/**
 * Whether a menu item is the page being viewed. A route matches itself and
 * the pages under it (/properti covers /properti/abc, not /propertiX); a
 * homepage section matches only on the homepage while that section is in view.
 * Pure on purpose, so it is tested without rendering the navbar.
 */
export function isNavItemActive(
  href: string,
  pathname: string,
  activeSection: string | null,
): boolean {
  if (pathname.startsWith("/admin")) return false
  if (isHashLink(href)) {
    return pathname === "/" && activeSection === href.slice(href.indexOf("#") + 1)
  }
  return pathname === href || pathname.startsWith(`${href}/`)
}

/** The id of the dropdown holding the current page, or null when none does. */
export function activeNavGroup(pathname: string, activeSection: string | null): string | null {
  const group = NAV_GROUPS.find((g) =>
    g.items.some((item) => isNavItemActive(item.href, pathname, activeSection)),
  )
  return group?.id ?? null
}
