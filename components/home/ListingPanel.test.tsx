import { render, screen, fireEvent, within } from "@testing-library/react"
import { SessionProvider } from "next-auth/react"
import ListingPanel, { panelHref } from "@/components/home/ListingPanel"
import { groupByType } from "@/lib/listing-groups"
import type { PropertyWithImages } from "@/lib/types"

function listing(id: string, type: PropertyWithImages["type"], listingType: "jual" | "sewa"): PropertyWithImages {
  return {
    id, title: `Listing ${id}`, description: null, price: "1000000000", listingType, type,
    city: "Jakarta", address: null, lat: null, lng: null, images: [], bedrooms: null,
    bathrooms: null, buildingArea: null, landArea: null, agentId: null, status: null, createdAt: null,
  }
}

const groups = {
  jual: groupByType([listing("j1", "rumah", "jual"), listing("j2", "ruko", "jual")]),
  sewa: groupByType([listing("s1", "apartemen", "sewa")]),
}

function renderPanel() {
  return render(
    <SessionProvider>
      <ListingPanel groups={groups} favoriteIds={[]} />
    </SessionProvider>,
  )
}

describe("ListingPanel", () => {
  it("opens on Dijual and Semua", () => {
    renderPanel()
    expect(screen.getByRole("tab", { name: "Dijual" })).toHaveAttribute("aria-selected", "true")
    expect(screen.getByRole("radio", { name: "Semua" })).toHaveAttribute("aria-checked", "true")
    expect(screen.getByText("Listing j1")).toBeInTheDocument()
    expect(screen.getByText("Listing j2")).toBeInTheDocument()
  })

  it("switches to rentals in place", () => {
    renderPanel()
    fireEvent.mouseDown(screen.getByRole("tab", { name: "Disewa" }))
    expect(screen.getByText("Listing s1")).toBeInTheDocument()
    expect(screen.queryByText("Listing j1")).not.toBeInTheDocument()
  })

  it("narrows to one property type", () => {
    renderPanel()
    fireEvent.click(screen.getByRole("radio", { name: "Ruko" }))
    expect(screen.getByText("Listing j2")).toBeInTheDocument()
    expect(screen.queryByText("Listing j1")).not.toBeInTheDocument()
  })

  it("says so, and links to the catalog, when a combination has nothing", () => {
    renderPanel()
    fireEvent.click(screen.getByRole("radio", { name: "Tanah" }))
    expect(screen.getByText("Belum ada listing untuk pilihan ini.")).toBeInTheDocument()
    expect(screen.queryByRole("region")).not.toBeInTheDocument()
  })

  it("points Lihat Semua at the catalog filtered the same way", () => {
    renderPanel()
    fireEvent.click(screen.getByRole("radio", { name: "Rumah" }))
    expect(screen.getByRole("link", { name: /lihat semua/i })).toHaveAttribute(
      "href",
      "/properti?listingType=jual&type=rumah",
    )
  })

  it("labels the category row", () => {
    renderPanel()
    expect(within(screen.getByRole("group", { name: "Kategori" })).getAllByRole("radio")).toHaveLength(5)
  })

  it("ties the listings to the selected tab as its tab panel", () => {
    renderPanel()
    const panel = screen.getByRole("tabpanel")
    expect(panel).toHaveAccessibleName("Dijual")
    expect(within(panel).getByText("Listing j1")).toBeInTheDocument()
    fireEvent.mouseDown(screen.getByRole("tab", { name: "Disewa" }))
    expect(screen.getByRole("tabpanel")).toHaveAccessibleName("Disewa")
  })

  it("links the empty state onward to the catalog filtered the same way", () => {
    renderPanel()
    fireEvent.click(screen.getByRole("radio", { name: "Tanah" }))
    expect(screen.getByRole("link", { name: /lihat semua/i })).toHaveAttribute(
      "href",
      "/properti?listingType=jual&type=tanah",
    )
  })
})

describe("panelHref", () => {
  it("leaves out the type for Semua", () => {
    expect(panelHref("sewa", "semua")).toBe("/properti?listingType=sewa")
    expect(panelHref("jual", "tanah")).toBe("/properti?listingType=jual&type=tanah")
  })
})
