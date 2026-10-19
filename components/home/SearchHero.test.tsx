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

  it("submits the query and the jual/sewa choice to the catalog", () => {
    render(<SearchHero />)
    fireEvent.change(screen.getByRole("searchbox"), { target: { value: "Kemang" } })
    fireEvent.click(screen.getByRole("radio", { name: "Disewa" }))
    fireEvent.click(screen.getByRole("button", { name: "Cari Sekarang" }))
    expect(push).toHaveBeenCalledWith("/properti?q=Kemang&listingType=sewa")
  })

  it("offers jual/sewa as a labelled single-choice toggle group, Semua on by default", () => {
    render(<SearchHero />)
    expect(screen.getByRole("group", { name: "Dijual atau disewa" })).toBeInTheDocument()
    expect(screen.getByRole("radio", { name: "Semua" })).toHaveAttribute("aria-checked", "true")
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

  it("asks for a photo as wide as it is drawn on phones, where the tall banner crops a 3:2 photo to ~825px", () => {
    const { container } = render(<SearchHero />)
    expect(container.querySelector("img")?.getAttribute("sizes")).toMatch(/^\(max-width: 639px\) 830px, /)
  })
})
