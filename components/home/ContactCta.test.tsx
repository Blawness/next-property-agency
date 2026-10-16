import { render, screen } from "@testing-library/react"
import ContactCta from "@/components/home/ContactCta"

describe("ContactCta", () => {
  it("is the #contact section the navbar's Kontak link points at", () => {
    const { container } = render(<ContactCta whatsapp="" />)
    expect(container.querySelector("section")).toHaveAttribute("id", "contact")
  })

  it("always links to the agent index", () => {
    render(<ContactCta whatsapp="" />)
    expect(screen.getByRole("link", { name: "Lihat Agen Kami" })).toHaveAttribute("href", "/agen")
  })

  it("hides WhatsApp when the office has no number", () => {
    render(<ContactCta whatsapp="" />)
    expect(screen.queryByRole("link", { name: /whatsapp/i })).not.toBeInTheDocument()
  })

  it("offers WhatsApp in international form when there is a number", () => {
    render(<ContactCta whatsapp="081234567890" />)
    const link = screen.getByRole("link", { name: /whatsapp/i })
    expect(link).toHaveAttribute("href", expect.stringContaining("wa.me/6281234567890"))
    expect(link).toHaveAttribute("target", "_blank")
  })
})
