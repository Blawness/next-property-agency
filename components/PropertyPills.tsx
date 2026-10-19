import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"

interface PropertyPillsProps {
  listingType: string
  className?: string
}

export default function PropertyPills({ listingType, className }: PropertyPillsProps) {
  const isJual = listingType === "jual"
  return (
    <div className={cn("flex", className)}>
      <Badge className={cn("h-6 bg-white px-2.5 text-[11px] font-bold shadow-sm", isJual ? "text-primary" : "text-accent")}>
        {isJual ? "Dijual" : "Disewa"}
      </Badge>
    </div>
  )
}
