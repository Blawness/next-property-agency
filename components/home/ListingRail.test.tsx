import { render, screen } from "@testing-library/react"
import { SessionProvider } from "next-auth/react"
import ListingRail from "@/components/home/ListingRail"
import { TYPE_CHIPS, budgetChips } from "@/components/home/rail-chips"
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
        chips={TYPE_CHIPS}
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
    for (const chip of TYPE_CHIPS) {
      expect(screen.getByRole("link", { name: chip.label })).toHaveAttribute("href", chip.href)
    }
  })

  it("has a see-all link", () => {
    renderRail([listing])
    expect(screen.getByRole("link", { name: /lihat semua/i })).toHaveAttribute("href", "/properti")
  })
})

describe("chips", () => {
  it("offers every type plus rentals", () => {
    expect(TYPE_CHIPS.map((c) => c.href)).toEqual([
      "/properti",
      "/properti?type=rumah",
      "/properti?type=apartemen",
      "/properti?type=tanah",
      "/properti?type=ruko",
      "/properti?listingType=sewa",
    ])
  })

  it("marks only the budget range being shown", () => {
    const chips = budgetChips(BUDGET_RANGES[2])
    expect(chips.filter((c) => c.active).map((c) => c.label)).toEqual([BUDGET_RANGES[2].label])
    expect(chips).toHaveLength(BUDGET_RANGES.length)
  })

  it("does not announce the type chips as the current page — they link away to the catalog", () => {
    for (const chip of TYPE_CHIPS) {
      expect(chip).not.toHaveProperty("active", true)
    }
  })
})
