import { groupByType, PANEL_CATEGORIES } from "@/lib/listing-groups"
import type { PropertyWithImages } from "@/lib/types"

function listing(id: string, type: PropertyWithImages["type"]): PropertyWithImages {
  return {
    id, title: id, description: null, price: "1000000000", listingType: "jual", type,
    city: "Jakarta", address: null, lat: null, lng: null, images: [], bedrooms: null,
    bathrooms: null, buildingArea: null, landArea: null, agentId: null, status: null, createdAt: null,
  }
}

describe("groupByType", () => {
  it("has a group for every panel category, in order", () => {
    expect(PANEL_CATEGORIES).toEqual(["semua", "rumah", "apartemen", "tanah", "ruko"])
    expect(Object.keys(groupByType([]))).toEqual([...PANEL_CATEGORIES])
  })

  it("keeps the incoming order inside each group", () => {
    const g = groupByType([listing("a", "rumah"), listing("b", "ruko"), listing("c", "rumah")])
    expect(g.semua.map((p) => p.id)).toEqual(["a", "b", "c"])
    expect(g.rumah.map((p) => p.id)).toEqual(["a", "c"])
    expect(g.ruko.map((p) => p.id)).toEqual(["b"])
  })

  it("leaves a type with no listings as an empty group", () => {
    expect(groupByType([listing("a", "rumah")]).tanah).toEqual([])
  })

  it("caps every group, Semua included", () => {
    const many = Array.from({ length: 15 }, (_, i) => listing(`r${i}`, "rumah"))
    const g = groupByType(many, 10)
    expect(g.semua).toHaveLength(10)
    expect(g.rumah).toHaveLength(10)
    expect(g.rumah[0].id).toBe("r0")
  })
})
