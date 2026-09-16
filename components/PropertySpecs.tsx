import { BedDouble, Bath, Maximize2 } from "lucide-react"

interface PropertySpecsProps {
  bedrooms: number | null
  bathrooms: number | null
  buildingArea: number | null
  landArea: number | null
}

function Spec({
  icon: Icon,
  value,
  label,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>
  value: string | number
  label: string
}) {
  return (
    <div className="flex flex-col items-center gap-1.5 px-2 py-3 first:pl-0 last:pr-0 sm:px-4">
      <Icon size={18} className="text-primary" />
      <p className="font-sans text-2xl font-bold text-primary sm:text-3xl">{value}</p>
      <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
    </div>
  )
}

export default function PropertySpecs({
  bedrooms,
  bathrooms,
  buildingArea,
  landArea,
}: PropertySpecsProps) {
  const items: Array<{ icon: React.ComponentType<{ size?: number; className?: string }>; value: string | number; label: string }> = ([
    bedrooms != null && { icon: BedDouble, value: bedrooms, label: "Kamar Tidur" },
    bathrooms != null && { icon: Bath, value: bathrooms, label: "Kamar Mandi" },
    buildingArea != null && { icon: Maximize2, value: `${buildingArea} m²`, label: "Luas Bangunan" },
    landArea != null && { icon: Maximize2, value: `${landArea} m²`, label: "Luas Tanah" },
  ] as Array<{ icon: React.ComponentType<{ size?: number; className?: string }>; value: string | number; label: string } | null>).filter(
    (item): item is { icon: React.ComponentType<{ size?: number; className?: string }>; value: string | number; label: string } => item != null,
  )

  if (items.length === 0) return null

  return (
    <div className="divide-x divide-border rounded-2xl border border-border bg-secondary/40 px-4 grid grid-cols-2 sm:grid-cols-4 sm:divide-x">
      {items.map((item, i) => (
        <Spec key={i} icon={item.icon} value={item.value} label={item.label} />
      ))}
    </div>
  )
}
