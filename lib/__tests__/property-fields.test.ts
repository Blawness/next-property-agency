import { z } from "zod"
import {
  priceField,
  countField,
  latField,
  lngField,
  roomsFor,
  validationErrorMessage,
} from "@/lib/property-fields"

describe("countField", () => {
  it("accepts blank and whole numbers from zero up", () => {
    for (const ok of ["", "0", "3", " 120 "]) expect(countField.safeParse(ok).success).toBe(true)
  })

  it("rejects negatives, decimals and text", () => {
    for (const bad of ["-3", "2.5", "tiga"]) expect(countField.safeParse(bad).success).toBe(false)
  })
})

describe("roomsFor", () => {
  it("drops rooms for tanah and keeps them for everything else", () => {
    expect(roomsFor("tanah", 3)).toBeNull()
    expect(roomsFor("rumah", 3)).toBe(3)
    expect(roomsFor(undefined, 2)).toBe(2)
  })
})

describe("validationErrorMessage", () => {
  it("names the first field's problem instead of a bare 'Validasi gagal'", () => {
    const result = z.object({ price: priceField }).safeParse({ price: "abc" })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(validationErrorMessage(result.error)).toBe(
        "Validasi gagal: Harga harus angka bulat tanpa titik atau koma",
      )
    }
  })
})

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
