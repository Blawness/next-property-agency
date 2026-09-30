import { rupiahToJuta, jutaToRupiah } from "@/components/PropertyFilter"

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn() }),
  useSearchParams: () => new URLSearchParams(),
}))

describe("price fields in millions", () => {
  it("shows the URL's rupiah back in millions, not as raw rupiah", () => {
    // Showing "500000000" in a "(Juta)" field meant the next blur multiplied
    // it by a million again.
    expect(rupiahToJuta("500000000")).toBe("500")
    expect(rupiahToJuta("1500000")).toBe("1.5")
    expect(rupiahToJuta(null)).toBe("")
  })

  it("round-trips, so blurring an untouched field changes nothing", () => {
    for (const rupiah of ["500000000", "2000000000", "1500000", "750000"]) {
      expect(jutaToRupiah(rupiahToJuta(rupiah))).toBe(rupiah)
    }
  })

  it("treats blank or negative as no bound", () => {
    expect(jutaToRupiah("")).toBe("")
    expect(jutaToRupiah("  ")).toBe("")
    expect(jutaToRupiah("-5")).toBe("")
  })
})
