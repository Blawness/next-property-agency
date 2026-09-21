import { NAV_LINKS, isHashLink, isNavLinkActive } from "@/components/navbar/nav-links"

describe("isHashLink", () => {
  it("treats a homepage section link as a hash link", () => {
    expect(isHashLink("/#about")).toBe(true)
    expect(isHashLink("#about")).toBe(true)
  })

  it("treats a real route as navigable, so it can use <Link>", () => {
    expect(isHashLink("/properti")).toBe(false)
    expect(isHashLink("/agen")).toBe(false)
    expect(isHashLink("/")).toBe(false)
  })

  it("classifies every link the navbar actually renders", () => {
    const routes = NAV_LINKS.filter((l) => !isHashLink(l.href)).map((l) => l.href)
    expect(routes).toEqual(["/properti", "/agen"])
  })
})

describe("isNavLinkActive", () => {
  it("marks Listings on the catalog and on the map", () => {
    expect(isNavLinkActive("listings", "/properti", null)).toBe(true)
    expect(isNavLinkActive("listings", "/properti/abc", null)).toBe(true)
    expect(isNavLinkActive("listings", "/peta", null)).toBe(true)
  })

  it("marks Agen anywhere under /agen", () => {
    expect(isNavLinkActive("agents", "/agen", null)).toBe(true)
    expect(isNavLinkActive("agents", "/agen/a1", null)).toBe(true)
  })

  it("does not mark Listings while on an agent page", () => {
    expect(isNavLinkActive("listings", "/agen", null)).toBe(false)
  })

  it("does not mark Agen while on the catalog", () => {
    expect(isNavLinkActive("agents", "/properti", null)).toBe(false)
  })

  it("falls back to Home on the homepage until a section is observed", () => {
    expect(isNavLinkActive("home", "/", null)).toBe(true)
    expect(isNavLinkActive("about", "/", null)).toBe(false)
  })

  it("follows the observed section once there is one", () => {
    expect(isNavLinkActive("about", "/", "about")).toBe(true)
    expect(isNavLinkActive("home", "/", "about")).toBe(false)
  })

  it("marks no section link outside the homepage", () => {
    for (const id of ["home", "about", "how", "contact"]) {
      expect(isNavLinkActive(id, "/properti", "about")).toBe(false)
    }
  })

  it("marks nothing at all inside the admin panel", () => {
    for (const { id } of NAV_LINKS) {
      expect(isNavLinkActive(id, "/admin/properti", null)).toBe(false)
    }
  })

  it("never marks two links at once, on any path", () => {
    for (const pathname of ["/", "/properti", "/properti/abc", "/peta", "/agen", "/agen/a1"]) {
      const active = NAV_LINKS.filter((l) => isNavLinkActive(l.id, pathname, null))
      expect(active).toHaveLength(1)
    }
  })
})
