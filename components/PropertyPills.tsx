import { PROPERTY_TYPE_LABELS } from "@/lib/constants"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"

interface PropertyPillsProps {
  listingType: string
  type: string
  className?: string
}

export default function PropertyPills({ listingType, type, className }: PropertyPillsProps) {
  const isJual = listingType === "jual"
  return (
    <div className={cn("flex gap-1.5", className)}>
      <Badge className={cn("h-6 bg-white px-2.5 text-[11px] font-bold shadow-sm", isJual ? "text-primary" : "text-accent")}>
        {isJual ? "Dijual" : "Disewa"}
      </Badge>
      <Badge className="h-6 bg-white px-2.5 text-[11px] font-semibold text-foreground shadow-sm">
        {PROPERTY_TYPE_LABELS[type]}
      </Badge>
    </div>
  )
}
