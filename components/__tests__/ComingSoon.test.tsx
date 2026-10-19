import { render, screen } from "@testing-library/react"
import ComingSoon from "@/components/ComingSoon"

describe("ComingSoon", () => {
  it("names the page and says it is coming", () => {
    render(<ComingSoon title="Trihuni Hub" body="Halaman Trihuni Hub sedang kami siapkan." />)
    expect(screen.getByRole("heading", { level: 1, name: "Trihuni Hub" })).toBeInTheDocument()
    expect(screen.getByText("Segera hadir")).toBeInTheDocument()
    expect(screen.getByText("Halaman Trihuni Hub sedang kami siapkan.")).toBeInTheDocument()
  })

  it("offers a way on, to the catalog and to the contact band", () => {
    render(<ComingSoon title="Trihuni Hub" body="..." />)
    expect(screen.getByRole("link", { name: "Lihat Katalog" })).toHaveAttribute("href", "/properti")
    expect(screen.getByRole("link", { name: "Hubungi Kami" })).toHaveAttribute("href", "/#contact")
  })
})
