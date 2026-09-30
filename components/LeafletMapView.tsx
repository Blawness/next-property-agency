"use client"

import { useEffect } from "react"
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import { formatPriceCompact } from "@/lib/constants"

const icon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
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

const JAKARTA: [number, number] = [-6.2088, 106.8456]

function pinPositions(properties: PropertyPin[]): [number, number][] {
  return properties.flatMap((p) => {
    const lat = Number.parseFloat(p.lat ?? "")
    const lng = Number.parseFloat(p.lng ?? "")
    return Number.isFinite(lat) && Number.isFinite(lng) ? [[lat, lng] as [number, number]] : []
  })
}

/**
 * Frames every pin. `center` on MapContainer is read once at mount, so
 * centring on the first pin left a search spanning several cities with most
 * of its pins off-screen, and a new filter never moved the view at all.
 */
function FitToPins({ positions }: { positions: [number, number][] }) {
  const map = useMap()
  const key = positions.map((p) => p.join(",")).join(";")

  useEffect(() => {
    if (positions.length === 0) return
    if (positions.length === 1) {
      map.setView(positions[0], 14)
    } else {
      map.fitBounds(L.latLngBounds(positions), { padding: [40, 40], maxZoom: 15 })
    }
    // `key` stands in for `positions`, which is a new array every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, key])

  return null
}

export default function LeafletMapView({ properties }: { properties: PropertyPin[] }) {
  const positions = pinPositions(properties)

  return (
    <MapContainer
      center={positions[0] ?? JAKARTA}
      zoom={11}
      className="w-full h-full z-0"
      scrollWheelZoom
    >
      <FitToPins positions={positions} />
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {properties.map((prop) =>
        prop.lat && prop.lng ? (
          <Marker
            key={prop.id}
            position={[parseFloat(prop.lat), parseFloat(prop.lng)]}
            icon={icon}
          >
            <Popup>
              <div className="space-y-1 min-w-36 font-sans">
                <p className="font-semibold text-sm leading-tight text-foreground">{prop.title}</p>
                <p className="text-primary font-bold text-sm">
                  {formatPriceCompact(prop.price, prop.listingType)}
                </p>
                <p className="text-xs text-muted-foreground">{prop.city}</p>
                <a
                  href={`/properti/${prop.id}`}
                  className="mt-2 inline-block rounded-xl bg-primary px-3 py-1.5 text-[12px] font-semibold text-primary-foreground hover:bg-primary/90"
                >
                  Lihat Detail →
                </a>
              </div>
            </Popup>
          </Marker>
        ) : null
      )}
    </MapContainer>
  )
}
