export interface NavLink {
  href: string
  label: string
  id: string
}

export const NAV_LINKS: NavLink[] = [
  { href: "/#home", label: "Beranda", id: "home" },
  { href: "/#about", label: "Tentang", id: "about" },
  { href: "/#how", label: "Proses", id: "how" },
  { href: "/properti", label: "Properti", id: "listings" },
  { href: "/agen", label: "Agen", id: "agents" },
  { href: "/#contact", label: "Kontak", id: "contact" },
]

/** Sections observed on the homepage; the rest of the links point at routes. */
export const HOME_SECTIONS = ["home", "about", "how", "contact"]

/**
 * Hash links must stay plain anchors — `<Link>` cannot scroll to a section the
 * way the browser does. Everything else is a route and should navigate on the
 * client instead of reloading the whole app shell.
 */
export function isHashLink(href: string): boolean {
  return href.startsWith("#") || href.startsWith("/#")
}

/**
 * Which single nav item is highlighted. Pure on purpose: the previous version
 * lived inside the component and could only be checked by rendering the whole
 * navbar and looking for a bold class.
 */
export function isNavLinkActive(
  id: string,
  pathname: string,
  activeSection: string | null,
): boolean {
  if (pathname.startsWith("/admin")) return false
  if (id === "listings") return pathname.startsWith("/properti") || pathname.startsWith("/peta")
  if (id === "agents") return pathname.startsWith("/agen")

  // The remaining links point at homepage sections, so they can only be active
  // on the homepage itself; "home" stands in until the observer reports one.
  if (pathname !== "/") return false
  return activeSection ? activeSection === id : id === "home"
}
