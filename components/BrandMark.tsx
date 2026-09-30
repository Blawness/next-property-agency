import { cn } from "@/lib/utils"
import { BRAND } from "@/lib/brand"

interface BrandMarkProps {
  size?: "sm" | "md" | "lg"
  className?: string
  /** Use off-white text + light box (e.g. on dark/footer backgrounds) */
  inverted?: boolean
}

const SIZE_MAP = {
  sm: { box: 24, monogram: 13, wordmark: 16, gap: 8 },
  md: { box: 32, monogram: 17, wordmark: 22, gap: 10 },
  lg: { box: 44, monogram: 23, wordmark: 30, gap: 12 },
} as const

/**
 * Placeholder logo: the monogram in a square, then the name. The agency's own
 * logo replaces what this renders; every page goes through this component, so
 * nothing else has to change when it does.
 */
export default function BrandMark({ size = "md", className, inverted = false }: BrandMarkProps) {
  const s = SIZE_MAP[size]
  return (
    <span
      className={cn("inline-flex shrink-0 select-none items-center font-sans", className)}
      style={{ gap: s.gap }}
    >
      <span
        aria-hidden
        className={cn(
          "inline-flex shrink-0 items-center justify-center rounded-sm font-heading font-bold leading-none",
          inverted ? "bg-primary-foreground text-primary" : "bg-primary text-primary-foreground",
        )}
        style={{ width: s.box, height: s.box, fontSize: s.monogram }}
      >
        {BRAND.logo.monogram}
      </span>
      <span
        className={cn(
          "font-bold leading-none tracking-tight",
          inverted ? "text-primary-foreground" : "text-foreground",
        )}
        style={{ fontSize: s.wordmark }}
      >
        {BRAND.logo.wordmark}
      </span>
    </span>
  )
}
