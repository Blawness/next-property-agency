import { PROPERTY_TYPE_LABELS } from "@/lib/constants"
import { cn } from "@/lib/utils"

interface PropertyPillsProps {
  listingType: string
  type: string
  className?: string
}

export default function PropertyPills({ listingType, type, className }: PropertyPillsProps) {
  const isJual = listingType === "jual"
  return (
    <div className={cn("flex gap-1.5", className)}>
      <span
        className={cn(
          "inline-flex items-center rounded-full bg-white px-2.5 py-[3px] text-[11px] font-bold shadow-sm",
          isJual ? "text-primary" : "text-accent",
        )}
      >
        {isJual ? "Dijual" : "Disewa"}
      </span>
      <span className="inline-flex items-center rounded-full bg-white px-2.5 py-[3px] text-[11px] font-semibold text-foreground shadow-sm">
        {PROPERTY_TYPE_LABELS[type]}
      </span>
    </div>
  )
}
