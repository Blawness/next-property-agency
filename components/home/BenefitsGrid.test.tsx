import { render, screen } from "@testing-library/react"
import BenefitsGrid from "@/components/home/BenefitsGrid"
import { BRAND } from "@/lib/brand"

describe("BenefitsGrid", () => {
  it("renders every benefit with its title and description", () => {
    render(<BenefitsGrid />)
    expect(screen.getAllByRole("listitem")).toHaveLength(BRAND.benefits.items.length)
    for (const item of BRAND.benefits.items) {
      expect(screen.getByRole("heading", { name: item.title })).toBeInTheDocument()
      expect(screen.getByText(item.description)).toBeInTheDocument()
    }
  })
})
