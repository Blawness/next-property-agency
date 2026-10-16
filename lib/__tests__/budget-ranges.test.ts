import { BUDGET_RANGES, budgetHref, budgetParams } from "@/lib/budget-ranges"
import { parseCatalogFilters } from "@/lib/catalog-query"

/** Whether a price passes a range's bounds the way catalogConditions applies them (gte / lte). */
function inRange(price: number, raw: ReturnType<typeof budgetParams>): boolean {
  const f = parseCatalogFilters(raw)
  if (f.minPrice && price < Number(f.minPrice)) return false
  if (f.maxPrice && price > Number(f.maxPrice)) return false
  return true
}

describe("BUDGET_RANGES", () => {
  it("covers sale listings only", () => {
    for (const range of BUDGET_RANGES) {
      expect(budgetParams(range).listingType).toBe("jual")
    }
  })

  it("puts every price, boundaries included, in exactly one range", () => {
    const prices = [
      0, 1, 499_999_999, 500_000_000, 500_000_001, 999_999_999, 1_000_000_000,
      2_999_999_999, 3_000_000_000, 25_000_000_000,
    ]
    for (const price of prices) {
      const hits = BUDGET_RANGES.filter((r) => inRange(price, budgetParams(r)))
      expect({ price, hits: hits.length }).toEqual({ price, hits: 1 })
    }
  })

  it("produces bounds that parseCatalogFilters accepts unchanged", () => {
    for (const range of BUDGET_RANGES) {
      const raw = budgetParams(range)
      const f = parseCatalogFilters(raw)
      expect(f.minPrice).toBe(raw.minPrice)
      expect(f.maxPrice).toBe(raw.maxPrice)
      expect(f.listingType).toBe("jual")
    }
  })

  it("has unique ids", () => {
    const ids = BUDGET_RANGES.map((r) => r.id)
    expect(new Set(ids).size).toBe(ids.length)
  })
})

describe("budgetHref", () => {
  it("links the cheapest range with only an upper bound", () => {
    expect(budgetHref(BUDGET_RANGES[0])).toBe("/properti?listingType=jual&maxPrice=499999999")
  })

  it("links the top range with only a lower bound", () => {
    expect(budgetHref(BUDGET_RANGES[BUDGET_RANGES.length - 1])).toBe(
      "/properti?listingType=jual&minPrice=3000000000",
    )
  })
})
