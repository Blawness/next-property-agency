import { render, screen } from "@testing-library/react"
import Rail from "@/components/home/Rail"

function renderRail() {
  return render(
    <Rail label="Pilihan Untukmu">
      <div>Rumah A</div>
      <div>Rumah B</div>
    </Rail>,
  )
}

describe("Rail", () => {
  it("is a labelled carousel region", () => {
    renderRail()
    const region = screen.getByRole("region", { name: "Pilihan Untukmu" })
    expect(region).toHaveAttribute("aria-roledescription", "carousel")
  })

  it("puts each child in its own slide", () => {
    renderRail()
    const slides = screen.getAllByRole("group")
    expect(slides).toHaveLength(2)
    expect(slides[0]).toHaveAttribute("aria-roledescription", "slide")
    expect(slides[0]).toHaveTextContent("Rumah A")
  })

  it("disables the previous arrow at the start, so it never points nowhere", () => {
    renderRail()
    expect(screen.getByRole("button", { name: "Sebelumnya" })).toBeDisabled()
  })
})
