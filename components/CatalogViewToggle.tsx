import Link from "next/link"
import { List, Map as MapIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import type { CatalogView, RawCatalogParams } from "@/lib/catalog-query"

interface CatalogViewToggleProps {
  view: CatalogView
  /** The raw params as they arrived, so switching view keeps the search intact. */
  filters: RawCatalogParams
}

const OPTIONS = [
  { view: "daftar" as const, label: "Daftar", Icon: List },
  { view: "peta" as const, label: "Peta", Icon: MapIcon },
]

function hrefFor(view: CatalogView, filters: RawCatalogParams): string {
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(filters)) {
    // `page` is deliberately dropped: the map is not paginated, so carrying
    // "page 3" across would silently narrow the list on the way back.
    if (key === "view" || key === "page" || !value) continue
    params.set(key, value)
  }
  if (view !== "daftar") params.set("view", view)
  const query = params.toString()
  return query ? `/properti?${query}` : "/properti"
}

export default function CatalogViewToggle({ view, filters }: CatalogViewToggleProps) {
  return (
    <div className="inline-flex overflow-hidden rounded-sm border border-border">
      {OPTIONS.map(({ view: option, label, Icon }) => {
        const active = option === view
        return (
          <Link
            key={option}
            href={hrefFor(option, filters)}
            aria-current={active ? "true" : undefined}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 text-[13px] font-medium transition-colors",
              active
                ? "bg-primary text-primary-foreground"
                : "bg-background text-muted-foreground hover:bg-muted",
            )}
          >
            <Icon size={13} aria-hidden />
            {label}
          </Link>
        )
      })}
    </div>
  )
}
