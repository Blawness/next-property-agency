import {
  parseCatalogFilters,
  parsePriceBound,
  isCatalogView,
  CATALOG_ORDER_BY,
} from "@/lib/catalog-query"

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

describe("parsePriceBound", () => {
  it("keeps a whole number of rupiah", () => {
    expect(parsePriceBound("500000000")).toBe("500000000")
    expect(parsePriceBound(" 750000 ")).toBe("750000")
    expect(parsePriceBound("0")).toBe("0")
    expect(parsePriceBound("007")).toBe("7")
  })

  it("drops anything Postgres could not cast to numeric", () => {
    expect(parsePriceBound("abc")).toBeUndefined()
    expect(parsePriceBound("5e8")).toBeUndefined()
    expect(parsePriceBound("-1")).toBeUndefined()
    expect(parsePriceBound("1.5")).toBeUndefined()
    expect(parsePriceBound("")).toBeUndefined()
    expect(parsePriceBound(undefined)).toBeUndefined()
  })

  it("is what parseCatalogFilters applies to both bounds", () => {
    const f = parseCatalogFilters({ minPrice: "banyak", maxPrice: "2000000000" })
    expect(f.minPrice).toBeUndefined()
    expect(f.maxPrice).toBe("2000000000")
  })
})

describe("CATALOG_ORDER_BY", () => {
  it("ends every sort on a unique key so pages never overlap", () => {
    for (const keys of Object.values(CATALOG_ORDER_BY)) {
      expect(keys.length).toBeGreaterThanOrEqual(2)
    }
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
