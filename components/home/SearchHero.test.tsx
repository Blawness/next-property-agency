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

  it("uses the shadcn Select for the property type, still submitting as `type`", () => {
    const { container } = render(<SearchHero />)
    const trigger = screen.getByRole("combobox", { name: "Tipe properti" })
    expect(trigger).toHaveAttribute("data-slot", "select-trigger")
    expect(container.querySelector('form select[name="type"], form input[name="type"]')).not.toBeNull()
  })

  it("works as a plain GET form without JavaScript", () => {
    const { container } = render(<SearchHero />)
    const form = container.querySelector("form")!
    expect(form).toHaveAttribute("action", "/properti")
    expect(form).toHaveAttribute("method", "get")
  })


  it("submits the query from the search pill", () => {
    render(<SearchHero />)
    fireEvent.change(screen.getByRole("searchbox"), { target: { value: "Kemang" } })
    fireEvent.click(screen.getByRole("button", { name: "Cari" }))
    expect(push).toHaveBeenCalledWith("/properti?q=Kemang")
  })

  it("offers jual/sewa as a Select, submitted as blank until chosen", () => {
    const { container } = render(<SearchHero />)
    expect(screen.getByRole("combobox", { name: "Dijual atau disewa" })).toHaveAttribute("data-slot", "select-trigger")
    expect(container.querySelector('input[type="hidden"][name="listingType"]')).toHaveValue("")
  })

  it("runs full-bleed and slides up under the navbar", () => {
    const { container } = render(<SearchHero />)
    expect(container.querySelector("section")!.className).toContain("-mt-16")
    expect(container.querySelector("section")!.className).not.toContain("container")
  })

  it("asks for a photo as wide as the tall phone banner draws it", () => {
    const { container } = render(<SearchHero />)
    expect(container.querySelector("img")?.getAttribute("sizes")).toBe("(max-width: 767px) 840px, 100vw")
  })

  it("keeps the placeholder short enough to read whole in a 375px phone pill", () => {
    render(<SearchHero />)
    // ~250px of input at 14px fits about 26 characters before it is cut off.
    expect(screen.getByRole("searchbox").getAttribute("placeholder")!.length).toBeLessThanOrEqual(26)
  })
})
