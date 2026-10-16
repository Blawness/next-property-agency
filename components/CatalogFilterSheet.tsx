"use client"

import { Suspense } from "react"
import { SlidersHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import PropertyFilter from "@/components/PropertyFilter"

/**
 * The catalog's mobile filter drawer. It is a client component on purpose:
 * built in the server page, the trigger reached <SheetTrigger asChild> as a
 * still-lazy RSC element during SSR, Radix Slot rendered nothing for it, and
 * the client's button failed to hydrate against the empty server HTML.
 */
export default function CatalogFilterSheet() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="lg">
          <SlidersHorizontal size={14} /> Filter
        </Button>
      </SheetTrigger>
      <SheetContent side="left">
        <SheetHeader>
          <SheetTitle>Filter Properti</SheetTitle>
        </SheetHeader>
        <div className="px-4 py-4">
          <Suspense>
            <PropertyFilter />
          </Suspense>
        </div>
      </SheetContent>
    </Sheet>
  )
}
