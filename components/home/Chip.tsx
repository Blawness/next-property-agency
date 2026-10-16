import Link from "next/link"
import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

/** A pill link — the filter chips above the homepage rails. */
export default function Chip({
  href,
  active = false,
  children,
}: {
  href: string
  active?: boolean
  children: ReactNode
}) {
  return (
    <Link
      href={href}
      prefetch={false}
      aria-current={active ? "true" : undefined}
      className={cn(
        "inline-flex h-9 shrink-0 items-center rounded-full border px-4 text-[13px] font-medium transition-colors",
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-background text-foreground/75 hover:border-primary hover:text-primary",
      )}
    >
      {children}
    </Link>
  )
}
