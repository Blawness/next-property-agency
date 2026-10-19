import { render, screen, fireEvent } from "@testing-library/react"
import PropertyFilter, { rupiahToJuta, jutaToRupiah } from "@/components/PropertyFilter"

const push = jest.fn()
let mockParams = new URLSearchParams()

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
  useSearchParams: () => mockParams,
}))

beforeEach(() => {
  push.mockClear()
  mockParams = new URLSearchParams()
})

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

describe("bar layout", () => {
  it("shows property types as a single-choice toggle group with the current one on", () => {
    mockParams = new URLSearchParams("type=ruko")
    render(<PropertyFilter layout="bar" />)
    expect(screen.getByRole("group", { name: "Tipe properti" })).toBeInTheDocument()
    expect(screen.getByRole("radio", { name: "Ruko" })).toHaveAttribute("aria-checked", "true")
    expect(screen.getByRole("radio", { name: "Rumah" })).toHaveAttribute("aria-checked", "false")
  })

  it("filters by type with the same URL key as before, back on page one", () => {
    mockParams = new URLSearchParams("page=3&city=Bandung")
    render(<PropertyFilter layout="bar" />)
    fireEvent.click(screen.getByRole("radio", { name: "Apartemen" }))
    expect(push).toHaveBeenCalledWith("/properti?city=Bandung&type=apartemen")
  })

  it("clears the type when its active item is pressed again", () => {
    mockParams = new URLSearchParams("type=tanah")
    render(<PropertyFilter layout="bar" />)
    fireEvent.click(screen.getByRole("radio", { name: "Tanah" }))
    expect(push).toHaveBeenCalledWith("/properti?")
  })

  it("switches jual/sewa with its own labelled group", () => {
    render(<PropertyFilter layout="bar" />)
    expect(screen.getByRole("group", { name: "Dijual atau disewa" })).toBeInTheDocument()
    fireEvent.click(screen.getByRole("radio", { name: "Disewa" }))
    expect(push).toHaveBeenCalledWith("/properti?listingType=sewa")
  })

  it("stretches every dropdown to its column, like the text fields beside it", () => {
    render(<PropertyFilter layout="bar" />)
    for (const trigger of screen.getAllByRole("combobox")) {
      expect(trigger.className).toContain("w-full")
    }
  })
})
