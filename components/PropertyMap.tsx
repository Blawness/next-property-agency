"use client"

import dynamic from "next/dynamic"

const LeafletMap = dynamic(() => import("./LeafletMap"), {
  ssr: false,
  loading: () => (
    <div className="h-64 rounded-2xl bg-muted animate-pulse flex items-center justify-center text-muted-foreground text-sm">
      Memuat peta...
    </div>
  ),
})

interface Props {
  lat: number
  lng: number
  title: string
}

export default function PropertyMap({ lat, lng, title }: Props) {
  return <LeafletMap lat={lat} lng={lng} title={title} />
}
