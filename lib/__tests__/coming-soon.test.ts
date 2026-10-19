import { COMING_SOON_SLUGS, comingSoonPage } from "@/lib/coming-soon"
import { NAV_GROUPS, isHashLink } from "@/components/navbar/nav-links"

// Routes that already exist in app/ and so need no placeholder.
const EXISTING_ROUTES = new Set(["/properti"])

describe("coming-soon pages", () => {
  it("has a page for every navbar item that has no route of its own", () => {
    const missing = NAV_GROUPS.flatMap((g) => g.items)
      .map((i) => i.href)
      .filter((href) => !isHashLink(href) && !EXISTING_ROUTES.has(href))
      .filter((href) => !COMING_SOON_SLUGS.includes(href.slice(1) as never))
    expect(missing).toEqual([])
  })

  it("covers exactly the six placeholder slugs", () => {
    expect([...COMING_SOON_SLUGS].sort()).toEqual(["bisnis", "finance", "hub", "kerjasama", "studio", "tentang"])
  })

  it("finds a page by slug", () => {
    expect(comingSoonPage("hub")?.title).toBe("Trihuni Hub")
  })

  it("returns nothing for an unknown slug, including inherited object keys", () => {
    expect(comingSoonPage("tidak-ada")).toBeUndefined()
    expect(comingSoonPage("constructor")).toBeUndefined()
    expect(comingSoonPage("toString")).toBeUndefined()
  })

  it("never shadows an existing top-level route", () => {
    for (const taken of ["properti", "agen", "profil", "admin", "masuk", "daftar", "peta", "api"]) {
      expect(COMING_SOON_SLUGS).not.toContain(taken)
    }
  })
})
