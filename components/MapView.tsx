"use client"

import dynamic from "next/dynamic"

const LeafletMapView = dynamic(() => import("./LeafletMapView"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-muted flex items-center justify-center text-muted-foreground">
      Memuat peta...
    </div>
  ),
})

interface PropertyPin {
  id: string
  title: string
  price: string
  listingType: string
  city: string
  lat: string | null
  lng: string | null
  images: { url: string }[]
}

export default function MapView({ properties }: { properties: PropertyPin[] }) {
  return <LeafletMapView properties={properties} />
}
