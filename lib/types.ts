export type PropertyType = "rumah" | "apartemen" | "tanah" | "ruko"
export type ListingType = "jual" | "sewa"
export type PropertyStatus = "active" | "sold" | "rented" | "archived"
export type UserRole = "buyer" | "agent" | "admin"

export interface Property {
  id: string
  title: string
  description: string | null
  price: string
  type: PropertyType
  listingType: ListingType
  city: string
  address: string | null
  lat: string | null
  lng: string | null
  landArea: number | null
  buildingArea: number | null
  bedrooms: number | null
  bathrooms: number | null
  agentId: string | null
  status: PropertyStatus | null
  createdAt: Date | null
}

export interface PropertyWithImages extends Property {
  images: PropertyImage[]
}

export interface PropertyImage {
  id: string
  propertyId: string | null
  url: string
  isPrimary: boolean | null
  order: number | null
}

export interface Profile {
  id: string
  fullName: string
  phone: string | null
  role: UserRole | null
  createdAt: Date | null
}
