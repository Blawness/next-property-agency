import { render, screen } from "@testing-library/react"
import Rail from "@/components/home/Rail"

describe("Rail", () => {
  it("shows a keyboard focus ring on the scrollable region it makes focusable", () => {
    render(
      <Rail label="Pilihan Untukmu">
        <div>card</div>
      </Rail>,
    )
    const region = screen.getByRole("region", { name: "Pilihan Untukmu" })
    expect(region).toHaveAttribute("tabindex", "0")
    expect(region.className).toContain("focus-visible:ring-2")
  })
})
