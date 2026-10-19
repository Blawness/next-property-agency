"use client"

import { Children, type ReactNode } from "react"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"

// Centred on the card photo — 260px wide at 4:3 is 195px tall, less half the
// 40px button — rather than on the whole card, where it would cover the title.
// Hidden at either end instead of shown disabled.
const ARROW = "inset-y-auto top-[77px] my-0 hidden size-10 bg-background shadow-md disabled:invisible md:flex"

/**
 * A horizontal row of listing cards on shadcn's Carousel (Embla): swipe and
 * trackpad scroll it natively, arrow keys move it while a card has focus, and
 * the arrows disable themselves at either end. The arrows are for a mouse, so
 * they only show from md up.
 */
export default function Rail({ children, label }: { children: ReactNode; label: string }) {
  return (
    <Carousel aria-label={label} opts={{ align: "start", dragFree: true }}>
      <CarouselContent>
        {Children.map(children, (child) => (
          <CarouselItem className="basis-auto">{child}</CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious className={`-left-4 ${ARROW}`} />
      <CarouselNext className={`-right-4 ${ARROW}`} />
    </Carousel>
  )
}
