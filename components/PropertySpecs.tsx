import type { ReactNode } from "react"
import { BedDouble, Bath, Maximize2 } from "lucide-react"

interface PropertySpecsProps {
  bedrooms: number | null
  bathrooms: number | null
  buildingArea: number | null
  landArea: number | null
}

interface SpecItem {
  icon: ReactNode
  value: string | number
  label: string
}

function Spec({ icon, value, label }: SpecItem) {
  return (
    <div className="flex flex-col items-center gap-1.5 px-2 py-3 first:pl-0 last:pr-0 sm:px-4">
      {icon}
      <p className="font-sans text-2xl font-bold text-primary sm:text-3xl">{value}</p>
      <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
    </div>
  )
}

const ICON_CLASS = "text-primary"

export default function PropertySpecs({
  bedrooms,
  bathrooms,
  buildingArea,
  landArea,
}: PropertySpecsProps) {
  // The icons are rendered here as elements, not handed to Spec as component
  // types: passed as a prop and rendered as <Icon />, the component reference
  // came through as undefined under Next 16's server renderer and took every
  // listing's detail page down to the error screen.
  const items: SpecItem[] = []
  if (bedrooms != null) {
    items.push({ icon: <BedDouble size={18} className={ICON_CLASS} />, value: bedrooms, label: "Kamar Tidur" })
  }
  if (bathrooms != null) {
    items.push({ icon: <Bath size={18} className={ICON_CLASS} />, value: bathrooms, label: "Kamar Mandi" })
  }
  if (buildingArea != null) {
    items.push({ icon: <Maximize2 size={18} className={ICON_CLASS} />, value: `${buildingArea} m²`, label: "Luas Bangunan" })
  }
  if (landArea != null) {
    items.push({ icon: <Maximize2 size={18} className={ICON_CLASS} />, value: `${landArea} m²`, label: "Luas Tanah" })
  }

  if (items.length === 0) return null

  return (
    <div className="divide-x divide-border rounded-2xl border border-border bg-secondary/40 px-4 grid grid-cols-2 sm:grid-cols-4 sm:divide-x">
      {items.map((item) => (
        <Spec key={item.label} icon={item.icon} value={item.value} label={item.label} />
      ))}
    </div>
  )
}
