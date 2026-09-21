import { render, screen } from "@testing-library/react"
import CatalogViewToggle from "@/components/CatalogViewToggle"

describe("CatalogViewToggle", () => {
  it("offers both views", () => {
    render(<CatalogViewToggle view="daftar" filters={{}} />)
    expect(screen.getByRole("link", { name: /daftar/i })).toBeInTheDocument()
    expect(screen.getByRole("link", { name: /peta/i })).toBeInTheDocument()
  })

  it("marks the current view for assistive tech, not just visually", () => {
    render(<CatalogViewToggle view="peta" filters={{}} />)
    expect(screen.getByRole("link", { name: /peta/i })).toHaveAttribute("aria-current", "true")
    expect(screen.getByRole("link", { name: /daftar/i })).not.toHaveAttribute("aria-current")
  })

  it("carries the active filters across when switching view", () => {
    render(
      <CatalogViewToggle
        view="daftar"
        filters={{ type: "rumah", city: "Bandung", q: "bintaro" }}
      />,
    )
    const peta = screen.getByRole("link", { name: /peta/i }).getAttribute("href")!
    expect(peta).toContain("view=peta")
    expect(peta).toContain("type=rumah")
    expect(peta).toContain("city=Bandung")
    expect(peta).toContain("q=bintaro")
  })

  it("drops the page number, because page 3 of a list means nothing on a map", () => {
    render(<CatalogViewToggle view="daftar" filters={{ type: "rumah", page: "3" }} />)
    expect(screen.getByRole("link", { name: /peta/i }).getAttribute("href")).not.toContain("page=")
  })

  it("omits empty filter values instead of trailing blank params", () => {
    render(<CatalogViewToggle view="daftar" filters={{ type: "rumah", city: "" }} />)
    expect(screen.getByRole("link", { name: /peta/i }).getAttribute("href")).not.toContain("city=")
  })
})
