import { parseCatalogFilters, isCatalogView } from "@/lib/catalog-query"

describe("parseCatalogFilters", () => {
  it("keeps values that are valid", () => {
    expect(
      parseCatalogFilters({
        type: "rumah",
        listingType: "sewa",
        city: "Bandung",
        minPrice: "500000000",
        maxPrice: "2000000000",
        minBedrooms: "3",
        q: "bintaro",
        sort: "termurah",
        page: "2",
      }),
    ).toEqual({
      type: "rumah",
      listingType: "sewa",
      city: "Bandung",
      minPrice: "500000000",
      maxPrice: "2000000000",
      minBedrooms: 3,
      q: "bintaro",
      sort: "termurah",
      page: 2,
      view: "daftar",
    })
  })

  it("drops a property type that is not one of ours", () => {
    expect(parseCatalogFilters({ type: "kastil" }).type).toBeUndefined()
  })

  it("drops a listing type that is not jual or sewa", () => {
    expect(parseCatalogFilters({ listingType: "lelang" }).listingType).toBeUndefined()
  })

  it("falls back to the default sort when the key is unknown", () => {
    expect(parseCatalogFilters({ sort: "terpopuler" }).sort).toBe("terbaru")
    expect(parseCatalogFilters({}).sort).toBe("terbaru")
  })

  it("never returns a page below 1", () => {
    expect(parseCatalogFilters({ page: "0" }).page).toBe(1)
    expect(parseCatalogFilters({ page: "-3" }).page).toBe(1)
    expect(parseCatalogFilters({ page: "abc" }).page).toBe(1)
    expect(parseCatalogFilters({}).page).toBe(1)
  })

  it("trims the search term and treats blank as absent", () => {
    expect(parseCatalogFilters({ q: "  bintaro  " }).q).toBe("bintaro")
    expect(parseCatalogFilters({ q: "   " }).q).toBeUndefined()
    expect(parseCatalogFilters({ q: "" }).q).toBeUndefined()
  })

  it("parses a bedroom floor and ignores one it cannot read", () => {
    expect(parseCatalogFilters({ minBedrooms: "3" }).minBedrooms).toBe(3)
    expect(parseCatalogFilters({ minBedrooms: "banyak" }).minBedrooms).toBeNull()
  })

  it("defaults to the list view and accepts the map view", () => {
    expect(parseCatalogFilters({}).view).toBe("daftar")
    expect(parseCatalogFilters({ view: "peta" }).view).toBe("peta")
    expect(parseCatalogFilters({ view: "galeri" }).view).toBe("daftar")
  })
})

describe("isCatalogView", () => {
  it("recognises the two views and nothing else", () => {
    expect(isCatalogView("daftar")).toBe(true)
    expect(isCatalogView("peta")).toBe(true)
    expect(isCatalogView("galeri")).toBe(false)
    expect(isCatalogView(undefined)).toBe(false)
  })
})
