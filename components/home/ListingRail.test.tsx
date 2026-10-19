import { render, screen } from "@testing-library/react"
import { SessionProvider } from "next-auth/react"
import ListingRail from "@/components/home/ListingRail"
import { budgetChips } from "@/components/home/rail-chips"
import { BUDGET_RANGES } from "@/lib/budget-ranges"
import type { PropertyWithImages } from "@/lib/types"

const listing: PropertyWithImages = {
  id: "p1",
  title: "Rumah Kemang",
  description: null,
  price: "2500000000",
  listingType: "jual",
  type: "rumah",
  city: "Jakarta",
  address: null,
  lat: null,
  lng: null,
  images: [],
  bedrooms: 3,
  bathrooms: 2,
  buildingArea: 120,
  landArea: 150,
  agentId: null,
  status: null,
  createdAt: null,
}

function renderRail(properties: PropertyWithImages[]) {
  return render(
    <SessionProvider>
      <ListingRail
        heading="Pilihan Untukmu"
        chips={budgetChips(BUDGET_RANGES[0])}
        properties={properties}
        favoriteIds={new Set()}
        seeAllHref="/properti"
      />
    </SessionProvider>,
  )
}

describe("ListingRail", () => {
  it("says so instead of rendering an empty rail when there are no listings", () => {
    renderRail([])
    expect(screen.getByText("Belum ada listing aktif saat ini.")).toBeInTheDocument()
    expect(screen.queryByRole("region")).not.toBeInTheDocument()
  })

  it("renders each listing as a card inside a scrollable region", () => {
    renderRail([listing, { ...listing, id: "p2", title: "Apartemen Sudirman" }])
    const region = screen.getByRole("region", { name: "Pilihan Untukmu" })
    expect(region).toHaveTextContent("Rumah Kemang")
    expect(region).toHaveTextContent("Apartemen Sudirman")
  })

  it("links every chip to the catalog", () => {
    renderRail([listing])
    for (const chip of budgetChips(BUDGET_RANGES[0])) {
      expect(screen.getByRole("link", { name: chip.label })).toHaveAttribute("href", chip.href)
    }
  })

  it("has a see-all link", () => {
    renderRail([listing])
    expect(screen.getByRole("link", { name: /lihat semua/i })).toHaveAttribute("href", "/properti")
  })
})

describe("chips", () => {

  it("marks only the budget range being shown", () => {
    const chips = budgetChips(BUDGET_RANGES[2])
    expect(chips.filter((c) => c.active).map((c) => c.label)).toEqual([BUDGET_RANGES[2].label])
    expect(chips).toHaveLength(BUDGET_RANGES.length)
  })

})
