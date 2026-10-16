import { render, screen, fireEvent } from "@testing-library/react"
import { renderToString } from "react-dom/server"
import CatalogFilterSheet from "@/components/CatalogFilterSheet"

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn() }),
  useSearchParams: () => new URLSearchParams(),
}))

describe("CatalogFilterSheet", () => {
  // The trigger used to be built in the server page and passed into
  // <SheetTrigger asChild>; Radix Slot saw a still-lazy RSC element during SSR
  // and rendered nothing, so the server HTML had no button and hydration failed.
  it("renders its Filter button in server HTML", () => {
    const html = renderToString(<CatalogFilterSheet />)
    expect(html).toMatch(/<button[^>]*>[\s\S]*Filter[\s\S]*<\/button>/)
  })

  it("opens the filter form in a drawer", () => {
    render(<CatalogFilterSheet />)
    fireEvent.click(screen.getByRole("button", { name: /filter/i }))
    expect(screen.getByRole("dialog", { name: "Filter Properti" })).toBeInTheDocument()
    expect(screen.getByLabelText("Cari")).toBeInTheDocument()
  })
})
