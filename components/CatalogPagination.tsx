import Link from "next/link"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

interface CatalogPaginationProps {
  page: number
  totalPages: number
  filters: Record<string, string | undefined>
}

function buildHref(filters: Record<string, string | undefined>, page: number): string {
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(filters)) {
    if (key !== "page" && value) params.set(key, value)
  }
  if (page > 1) params.set("page", String(page))
  const qs = params.toString()
  return qs ? `/properti?${qs}` : "/properti"
}

// Show a compact window of pages around the current one.
function pageWindow(page: number, totalPages: number): (number | "…")[] {
  if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1)
  const pages: (number | "…")[] = [1]
  if (page > 3) pages.push("…")
  for (let p = Math.max(2, page - 1); p <= Math.min(totalPages - 1, page + 1); p++) {
    pages.push(p)
  }
  if (page < totalPages - 2) pages.push("…")
  pages.push(totalPages)
  return pages
}

export default function CatalogPagination({ page, totalPages, filters }: CatalogPaginationProps) {
  if (totalPages <= 1) return null

  const base =
    "flex h-9 min-w-9 items-center justify-center rounded-xl border text-sm font-medium transition-colors"
  const idle = "border-border text-foreground hover:bg-muted"
  const activeCls = "border-primary bg-primary text-primary-foreground"
  const disabled = "border-border/50 text-muted-foreground/40 cursor-not-allowed"

  return (
    <nav aria-label="Navigasi halaman" className="mt-8 flex items-center justify-center gap-1.5">
      {page > 1 ? (
        <Link href={buildHref(filters, page - 1)} aria-label="Halaman sebelumnya" className={cn(base, idle)}>
          <ChevronLeft className="h-4 w-4" />
        </Link>
      ) : (
        <span aria-hidden className={cn(base, disabled)}>
          <ChevronLeft className="h-4 w-4" />
        </span>
      )}

      {pageWindow(page, totalPages).map((p, i) =>
        p === "…" ? (
          <span key={`e-${i}`} className="px-1 text-sm text-muted-foreground">
            …
          </span>
        ) : (
          <Link
            key={p}
            href={buildHref(filters, p)}
            aria-current={p === page ? "page" : undefined}
            className={cn(base, p === page ? activeCls : idle)}
          >
            {p}
          </Link>
        ),
      )}

      {page < totalPages ? (
        <Link href={buildHref(filters, page + 1)} aria-label="Halaman berikutnya" className={cn(base, idle)}>
          <ChevronRight className="h-4 w-4" />
        </Link>
      ) : (
        <span aria-hidden className={cn(base, disabled)}>
          <ChevronRight className="h-4 w-4" />
        </span>
      )}
    </nav>
  )
}
