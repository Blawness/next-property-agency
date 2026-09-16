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
          "inline-flex items-center rounded-full px-2.5 py-[3px] text-[10px] font-bold tracking-wide shadow-sm",
          isJual
            ? "bg-primary text-primary-foreground shadow-primary/30"
            : "bg-accent text-accent-foreground shadow-black/20",
        )}
      >
        {isJual ? "Dijual" : "Disewa"}
      </span>
      <span className="inline-flex items-center rounded-full bg-black/40 px-2.5 py-[3px] text-[10px] font-semibold text-white backdrop-blur-sm">
        {PROPERTY_TYPE_LABELS[type]}
      </span>
    </div>
  )
}
