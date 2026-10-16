import { render, screen, fireEvent } from "@testing-library/react"
import SearchHero, { searchHref } from "@/components/home/SearchHero"

const push = jest.fn()
jest.mock("next/navigation", () => ({ useRouter: () => ({ push }) }))

function formData(entries: Record<string, string>) {
  const fd = new FormData()
  for (const [k, v] of Object.entries(entries)) fd.set(k, v)
  return fd
}

describe("searchHref", () => {
  it("goes to the bare catalog when every field is blank", () => {
    expect(searchHref(formData({ q: "", type: "", listingType: "" }))).toBe("/properti")
  })

  it("treats a whitespace-only query as blank", () => {
    expect(searchHref(formData({ q: "   ", type: "", listingType: "" }))).toBe("/properti")
  })

  it("trims the query and keeps only filled fields", () => {
    expect(searchHref(formData({ q: "  Bandung ", type: "rumah", listingType: "" }))).toBe(
      "/properti?q=Bandung&type=rumah",
    )
  })

  it("carries jual/sewa", () => {
    expect(searchHref(formData({ q: "", type: "", listingType: "sewa" }))).toBe(
      "/properti?listingType=sewa",
    )
  })
})

describe("SearchHero", () => {
  beforeEach(() => push.mockClear())

  it("is the homepage's #home section", () => {
    const { container } = render(<SearchHero />)
    expect(container.querySelector("section")).toHaveAttribute("id", "home")
  })

  it("submits the filled fields to the catalog", () => {
    render(<SearchHero />)
    fireEvent.change(screen.getByRole("searchbox"), { target: { value: "Kemang" } })
    fireEvent.change(screen.getByRole("combobox"), { target: { value: "apartemen" } })
    fireEvent.click(screen.getByRole("radio", { name: "Disewa" }))
    fireEvent.click(screen.getByRole("button", { name: "Cari Sekarang" }))
    expect(push).toHaveBeenCalledWith("/properti?q=Kemang&type=apartemen&listingType=sewa")
  })

  it("works as a plain GET form without JavaScript", () => {
    const { container } = render(<SearchHero />)
    const form = container.querySelector("form")!
    expect(form).toHaveAttribute("action", "/properti")
    expect(form).toHaveAttribute("method", "get")
  })

  it("asks for a photo as wide as it is drawn on phones, where the tall banner crops a 3:2 photo to ~825px", () => {
    const { container } = render(<SearchHero />)
    expect(container.querySelector("img")?.getAttribute("sizes")).toMatch(/^\(max-width: 639px\) 830px, /)
  })
})
