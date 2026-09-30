import { priceField, latField, lngField } from "@/lib/property-fields"

describe("priceField", () => {
  it("accepts whole rupiah", () => {
    expect(priceField.safeParse("1500000000").success).toBe(true)
    expect(priceField.parse(" 3500000 ")).toBe("3500000")
  })

  it("rejects what the numeric column would refuse or render as a dash", () => {
    for (const bad of ["", "abc", "1,5 M", "1.500.000", "-5000000", "1e9"]) {
      expect(priceField.safeParse(bad).success).toBe(false)
    }
  })
})

describe("latField / lngField", () => {
  it("accepts blank, which clears the coordinate", () => {
    expect(latField.safeParse("").success).toBe(true)
    expect(lngField.safeParse("").success).toBe(true)
  })

  it("accepts a real coordinate", () => {
    expect(latField.safeParse("-6.2088").success).toBe(true)
    expect(lngField.safeParse("106.8456").success).toBe(true)
  })

  it("rejects text and out-of-range values", () => {
    expect(latField.safeParse("jakarta").success).toBe(false)
    expect(latField.safeParse("91").success).toBe(false)
    expect(lngField.safeParse("-181").success).toBe(false)
  })
})
