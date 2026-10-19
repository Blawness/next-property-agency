"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowRight, Building2, Home, LayoutGrid, Store, Trees } from "lucide-react"
import PropertyCard from "@/components/PropertyCard"
import Rail from "@/components/home/Rail"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { BRAND } from "@/lib/brand"
import { PANEL_CATEGORIES, type ListingGroups, type PanelCategory } from "@/lib/listing-groups"

type Tab = "jual" | "sewa"

const ICONS = { semua: LayoutGrid, rumah: Home, apartemen: Building2, tanah: Trees, ruko: Store } as const

/** The catalog, filtered the way the panel currently is. */
export function panelHref(listingType: Tab, category: PanelCategory): string {
  const params = new URLSearchParams({ listingType })
  if (category !== "semua") params.set("type", category)
  return `/properti?${params.toString()}`
}

/**
 * The homepage's listing panel: Dijual | Disewa tabs, a row of property-type
 * categories, and a rail of cards. Every combination arrives pre-grouped from
 * the server (two queries in all), so switching never fetches or navigates.
 */
export default function ListingPanel({
  groups,
  favoriteIds,
}: {
  groups: Record<Tab, ListingGroups>
  favoriteIds: string[]
}) {
  const copy = BRAND.listingPanel
  const [tab, setTab] = useState<Tab>("jual")
  const [category, setCategory] = useState<PanelCategory>("semua")
  const favorites = new Set(favoriteIds)
  const items = groups[tab][category]

  return (
    <section className="container mx-auto px-4 pt-8 sm:pt-10">
      <div className="overflow-hidden rounded-3xl bg-muted">
        <Tabs value={tab} onValueChange={(v) => setTab(v as Tab)}>
          {/* group-data-horizontal/tabs:h-auto: the shadcn list pins itself to h-8
              with a group variant that a plain h-auto cannot override. */}
          <TabsList className="grid h-auto w-full grid-cols-2 rounded-none bg-transparent p-0 group-data-horizontal/tabs:h-auto">
            {(["jual", "sewa"] as const).map((t) => (
              <TabsTrigger
                key={t}
                value={t}
                className="h-14 rounded-none border-0 bg-border/70 text-[15px] font-semibold text-muted-foreground shadow-none data-[state=active]:bg-muted data-[state=active]:text-primary data-[state=active]:shadow-none"
              >
                {copy.tabs[t]}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        <div className="px-4 pb-6 pt-5 sm:px-6">
          <h2 className="sr-only">{copy.heading}</h2>
          <ToggleGroup
            type="single"
            aria-label="Kategori"
            value={category}
            onValueChange={(v) => v && setCategory(v as PanelCategory)}
            spacing={0}
            className="-mx-4 mb-5 w-auto justify-start gap-1 overflow-x-auto px-4 sm:-mx-6 sm:px-6 [scrollbar-width:none]"
          >
            {PANEL_CATEGORIES.map((c) => {
              const Icon = ICONS[c]
              return (
                <ToggleGroupItem
                  key={c}
                  value={c}
                  className="h-auto shrink-0 flex-col gap-1 rounded-none border-b-2 border-transparent bg-transparent px-4 pb-2 pt-1 text-[13px] font-medium text-muted-foreground hover:bg-transparent data-[state=on]:border-primary data-[state=on]:bg-transparent data-[state=on]:text-foreground"
                >
                  <Icon size={20} aria-hidden />
                  {copy.categories[c]}
                </ToggleGroupItem>
              )
            })}
          </ToggleGroup>

          {items.length === 0 ? (
            <p className="rounded-xl border border-dashed border-border bg-background py-12 text-center text-sm text-muted-foreground">
              {copy.empty}
            </p>
          ) : (
            <Rail label={`${copy.heading}: ${copy.tabs[tab]} ${copy.categories[category]}`}>
              {items.map((property) => (
                <PropertyCard
                  key={property.id}
                  property={property}
                  variant="rail"
                  initialFavorited={favorites.has(property.id)}
                />
              ))}
            </Rail>
          )}

          <div className="mt-6 flex justify-center">
            <Button asChild variant="outline" className="h-10 bg-background px-6 font-semibold">
              <Link href={panelHref(tab, category)} prefetch={false}>
                {copy.seeAll}
                <ArrowRight size={15} aria-hidden />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
