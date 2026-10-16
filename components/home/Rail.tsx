"use client"

import { useRef, type ReactNode } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"

const ARROW =
  "absolute top-[30%] z-10 hidden h-10 w-10 items-center justify-center rounded-full border border-border bg-background text-foreground shadow-md transition-colors hover:bg-muted md:flex"

/**
 * A horizontal, snap-scrolling row. Touch and trackpad scroll it natively; the
 * arrows are for a mouse, so they only show from md up.
 */
export default function Rail({ children, label }: { children: ReactNode; label: string }) {
  const ref = useRef<HTMLDivElement>(null)

  function step(direction: 1 | -1) {
    const el = ref.current
    // jsdom has no scrollBy; neither do some very old browsers.
    el?.scrollBy?.({ left: direction * el.clientWidth * 0.8, behavior: "smooth" })
  }

  return (
    <div className="relative">
      <div
        ref={ref}
        role="region"
        aria-label={label}
        tabIndex={0}
        className="-mx-4 flex snap-x snap-mandatory scroll-px-4 gap-4 overflow-x-auto px-4 pb-3 outline-none focus-visible:ring-2 focus-visible:ring-ring [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {children}
      </div>
      <button type="button" aria-label="Geser ke kiri" onClick={() => step(-1)} className={`${ARROW} -left-4`}>
        <ChevronLeft size={18} aria-hidden />
      </button>
      <button type="button" aria-label="Geser ke kanan" onClick={() => step(1)} className={`${ARROW} -right-4`}>
        <ChevronRight size={18} aria-hidden />
      </button>
    </div>
  )
}
