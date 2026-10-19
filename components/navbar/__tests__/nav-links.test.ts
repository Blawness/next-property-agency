import { NAV_GROUPS, activeNavGroup, isHashLink, isNavItemActive } from "@/components/navbar/nav-links"

describe("NAV_GROUPS", () => {
  it("follows the brief: three dropdowns in order", () => {
    expect(NAV_GROUPS.map((g) => g.label)).toEqual(["Produk Trihuni", "Trihuni Corp", "Tentang Trihuni"])
  })

  it("lists each dropdown's items in the brief's order", () => {
    expect(NAV_GROUPS.map((g) => g.items.map((i) => i.label))).toEqual([
      ["Kunjungi Kerjasama", "Trihuni Catalog", "Trihuni Finance", "Trihuni Studio"],
      ["For Business", "Trihuni Hub"],
      ["Tentang Kami", "Kontak Kami"],
    ])
  })

  it("sends Catalog to the catalog and Kontak Kami to the homepage contact band", () => {
    const all = NAV_GROUPS.flatMap((g) => g.items)
    expect(all.find((i) => i.label === "Trihuni Catalog")?.href).toBe("/properti")
    expect(all.find((i) => i.label === "Kontak Kami")?.href).toBe("/#contact")
  })

  it("has no duplicate destinations", () => {
    const hrefs = NAV_GROUPS.flatMap((g) => g.items.map((i) => i.href))
    expect(new Set(hrefs).size).toBe(hrefs.length)
  })
})

describe("isHashLink", () => {
  it("treats a homepage section link as a hash link", () => {
    expect(isHashLink("/#contact")).toBe(true)
    expect(isHashLink("#contact")).toBe(true)
  })

  it("treats a real route as navigable, so it can use <Link>", () => {
    expect(isHashLink("/properti")).toBe(false)
    expect(isHashLink("/tentang")).toBe(false)
  })
})

describe("isNavItemActive", () => {
  it("marks a route item on its page and the pages under it", () => {
    expect(isNavItemActive("/properti", "/properti", null)).toBe(true)
    expect(isNavItemActive("/properti", "/properti/abc", null)).toBe(true)
  })

  it("does not match a route that merely shares a prefix", () => {
    expect(isNavItemActive("/hub", "/hubungi", null)).toBe(false)
  })

  it("marks a section item only on the homepage, once that section is in view", () => {
    expect(isNavItemActive("/#contact", "/", "contact")).toBe(true)
    expect(isNavItemActive("/#contact", "/", "home")).toBe(false)
    expect(isNavItemActive("/#contact", "/properti", "contact")).toBe(false)
  })

  it("marks nothing inside the admin panel", () => {
    expect(isNavItemActive("/properti", "/admin/properti", null)).toBe(false)
  })
})

describe("activeNavGroup", () => {
  it("highlights Produk Trihuni on the catalog and a listing", () => {
    expect(activeNavGroup("/properti", null)).toBe("produk")
    expect(activeNavGroup("/properti/abc", null)).toBe("produk")
  })

  it("highlights the group of a coming-soon page", () => {
    expect(activeNavGroup("/hub", null)).toBe("corp")
    expect(activeNavGroup("/tentang", null)).toBe("tentang")
  })

  it("highlights Tentang Trihuni when the homepage contact band is in view", () => {
    expect(activeNavGroup("/", "contact")).toBe("tentang")
  })

  it("highlights nothing on the homepage top, the agent pages, or admin", () => {
    expect(activeNavGroup("/", null)).toBeNull()
    expect(activeNavGroup("/", "home")).toBeNull()
    expect(activeNavGroup("/agen", null)).toBeNull()
    expect(activeNavGroup("/admin", null)).toBeNull()
  })
})
