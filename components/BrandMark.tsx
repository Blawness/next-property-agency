import { cn } from "@/lib/utils"

interface BrandMarkProps {
  size?: "sm" | "md" | "lg"
  className?: string
  /** Use off-white text + brown box (e.g. on dark/footer backgrounds) */
  inverted?: boolean
}

const SIZE_MAP = {
  sm: { box: 24, tap: 16, catalog: 9, gap: 8 },
  md: { box: 32, tap: 22, catalog: 11, gap: 10 },
  lg: { box: 44, tap: 30, catalog: 13, gap: 12 },
} as const

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
          "inline-flex items-center justify-center rounded-lg shrink-0",
          inverted ? "bg-primary-foreground" : "bg-primary",
        )}
        style={{ width: s.box, height: s.box }}
      >
        <svg
          viewBox="0 0 24 24"
          width={Math.round(s.box * 0.6)}
          height={Math.round(s.box * 0.6)}
          fill="none"
        >
          <path
            d="M5 8 L19 8 L19 19 L5 19 Z"
            className={inverted ? "stroke-primary" : "stroke-primary-foreground"}
            strokeWidth="2"
            strokeLinejoin="round"
          />
          <path d="M5 12 L19 12" className={inverted ? "stroke-primary" : "stroke-primary-foreground"} strokeWidth="2" />
          <path d="M5 15.5 L19 15.5" className={inverted ? "stroke-primary" : "stroke-primary-foreground"} strokeWidth="2" />
          <path d="M5 8 L12 4 L19 8" className={inverted ? "stroke-primary" : "stroke-primary-foreground"} strokeWidth="2" strokeLinejoin="round" />
        </svg>
      </span>
      <span className="flex items-baseline gap-1.5 leading-none">
        <span
          className={cn(
            "font-extrabold tracking-tight",
            inverted ? "text-primary-foreground" : "text-foreground",
          )}
          style={{ fontSize: s.tap }}
        >
          TAP
        </span>
        <span
          className={cn(
            "font-semibold uppercase tracking-[0.2em]",
            inverted ? "text-primary-foreground/70" : "text-muted-foreground",
          )}
          style={{ fontSize: s.catalog }}
        >
          CATALOG
        </span>
      </span>
    </span>
  )
}
