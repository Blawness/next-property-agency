# Lebih Mirip Rukita Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Hero full-bleed melengkung dengan navbar transparan, panel listing bertab yang berganti di tempat, dan kartu listing flat — pola Rukita dengan identitas TRIHUNI.

**Architecture:** Homepage tetap server component; data panel diambil dalam dua query (per `listingType`, `limit 48`) lalu dikelompokkan per tipe oleh fungsi pure `groupByType`, dan diteruskan ke `ListingPanel` (client) yang berganti tab tanpa navigasi. Navbar membaca `useOverHero(pathname)` untuk mode transparan di `/`. `PropertyCard` diratakan untuk semua pemakai.

**Tech Stack:** Next.js 16, React 19, Tailwind v4, shadcn/ui (Tabs, ToggleGroup, Carousel, Select), lucide-react, Jest + Testing Library.

**Spec:** `docs/superpowers/specs/2026-10-19-rukita-closer-design.md`

## Global Constraints

- Font tetap Plus Jakarta Sans; warna tetap palet TRIHUNI (terakota `--primary`, cokelat `--accent`). Tanpa aset/copy Rukita.
- Tanpa perubahan skema DB. Listing hanya lewat `getPropertiesWithImagesBatch`; filter hanya lewat `catalogConditions(parseCatalogFilters(...))`.
- Query homepage tetap kecil: panel = 2 query listing (+ batch gambar), bukan per kombinasi.
- Brand string lewat `BRAND` (`lib/brand.ts`).
- Hanya foto hero yang `loading="eager"` + `fetchPriority="high"`; `sizes` = lebar gambar yang digambar.
- `shadcn add`: tolak timpa `button.tsx`; ubah import `cn` ke `@/lib/utils`; lepas dependency `cn`.
- Verifikasi: `pnpm lint → pnpm typecheck → pnpm test → pnpm build`.
- Commit diakhiri `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.

## Review Focus

1. **Kombinasi tab/kategori tanpa listing** (mis. Disewa + Tanah) → pesan kosong dan tombol ke katalog terfilter, bukan carousel kosong. Diuji di Task 3.
2. **Navbar transparan di halaman selain `/`** → harus solid di semua halaman lain, termasuk setelah navigasi client dari `/`. Diuji di Task 5.
3. **Navbar setelah hero lewat** → solid (teks gelap di atas latar putih), bukan putih di atas putih. Diuji di Task 5.
4. **Harga sewa** → "/bulan", dan harga tidak terakota. Diuji di Task 2.
5. **Pencarian mobile** (hanya input) → tetap ke `/properti?q=…` tanpa parameter tipe/jual-sewa kosong. Diuji di Task 4.

## Deviasi dari spec (disengaja)

- Search pill berada **di dalam** bagian bawah hero (seperti screenshot Rukita), bukan menggantung setengah keluar; panel listing mulai di bawah hero **tanpa menimpa**. Dua elemen yang sama-sama menimpa batas hero akan bertabrakan.
- `useOverHero` memakai pengukuran saat scroll (versi lama dari git, yang sudah menangani hero yang di-stream) alih-alih IntersectionObserver, ditambah restart per pathname.
- Kartu: badge foto hanya **Dijual/Disewa**; tipe properti pindah ke baris label berikon di bawah foto — tidak mengulang informasi yang sama dua kali.

## File Structure

- Create `lib/listing-groups.ts`, `lib/__tests__/listing-groups.test.ts` — pengelompokan pure.
- Create `components/ui/tabs.tsx` (shadcn add).
- Create `components/home/ListingPanel.tsx`, `components/home/ListingPanel.test.tsx`.
- Create `components/navbar/useOverHero.ts`, `components/navbar/__tests__/useOverHero.test.tsx`.
- Modify `components/PropertyCard.tsx`, `components/PropertyCard.test.tsx`, `components/PropertyPills.tsx`.
- Modify `components/home/SearchHero.tsx`, `components/home/SearchHero.test.tsx`.
- Modify `components/Navbar.tsx`, `components/navbar/DesktopNav.tsx`, `components/navbar/MobileNav.tsx`, `components/navbar/UserMenu.tsx`, `components/Navbar.test.tsx`.
- Modify `app/page.tsx`, `lib/brand.ts`, `AGENTS.md`.

---

### Task 1: Pengelompokan listing per tipe

**Files:** Create `lib/listing-groups.ts`; Test `lib/__tests__/listing-groups.test.ts`

**Interfaces:**
- Produces: `type PanelCategory = "semua" | "rumah" | "apartemen" | "tanah" | "ruko"`, `const PANEL_CATEGORIES: readonly PanelCategory[]`, `type ListingGroups = Record<PanelCategory, PropertyWithImages[]>`, `function groupByType(items: PropertyWithImages[], perGroup?: number): ListingGroups` (default 10).

- [ ] **Step 1: Test gagal**

```ts
import { groupByType, PANEL_CATEGORIES } from "@/lib/listing-groups"
import type { PropertyWithImages } from "@/lib/types"

function listing(id: string, type: PropertyWithImages["type"]): PropertyWithImages {
  return {
    id, title: id, description: null, price: "1000000000", listingType: "jual", type,
    city: "Jakarta", address: null, lat: null, lng: null, images: [], bedrooms: null,
    bathrooms: null, buildingArea: null, landArea: null, agentId: null, status: null, createdAt: null,
  }
}

describe("groupByType", () => {
  it("has a group for every panel category, in order", () => {
    expect(PANEL_CATEGORIES).toEqual(["semua", "rumah", "apartemen", "tanah", "ruko"])
    expect(Object.keys(groupByType([]))).toEqual([...PANEL_CATEGORIES])
  })

  it("keeps the incoming order inside each group", () => {
    const g = groupByType([listing("a", "rumah"), listing("b", "ruko"), listing("c", "rumah")])
    expect(g.semua.map((p) => p.id)).toEqual(["a", "b", "c"])
    expect(g.rumah.map((p) => p.id)).toEqual(["a", "c"])
    expect(g.ruko.map((p) => p.id)).toEqual(["b"])
  })

  it("leaves a type with no listings as an empty group", () => {
    expect(groupByType([listing("a", "rumah")]).tanah).toEqual([])
  })

  it("caps every group, Semua included", () => {
    const many = Array.from({ length: 15 }, (_, i) => listing(`r${i}`, "rumah"))
    const g = groupByType(many, 10)
    expect(g.semua).toHaveLength(10)
    expect(g.rumah).toHaveLength(10)
    expect(g.rumah[0].id).toBe("r0")
  })
})
```

- [ ] **Step 2:** `pnpm test lib/__tests__/listing-groups.test.ts` → FAIL (module tidak ada).

- [ ] **Step 3: Implementasi**

```ts
import type { PropertyWithImages } from "@/lib/types"

/** The homepage panel's category row: everything, then each property type. */
export const PANEL_CATEGORIES = ["semua", "rumah", "apartemen", "tanah", "ruko"] as const
export type PanelCategory = (typeof PANEL_CATEGORIES)[number]
export type ListingGroups = Record<PanelCategory, PropertyWithImages[]>

/**
 * Splits one listing type's newest listings into the panel's categories, so
 * switching category in the browser needs no query. Order is kept; every
 * group, "semua" included, holds at most `perGroup`.
 */
export function groupByType(items: PropertyWithImages[], perGroup = 10): ListingGroups {
  const groups = Object.fromEntries(PANEL_CATEGORIES.map((c) => [c, []])) as unknown as ListingGroups
  for (const item of items) {
    if (groups.semua.length < perGroup) groups.semua.push(item)
    const own = groups[item.type as PanelCategory]
    if (own && own.length < perGroup) own.push(item)
  }
  return groups
}
```

- [ ] **Step 4:** test → PASS 4/4.
- [ ] **Step 5:** commit `feat(home): kelompokkan listing per tipe untuk panel bertab`.

---

### Task 2: Kartu flat

**Files:** Modify `components/PropertyCard.tsx`, `components/PropertyPills.tsx`; Test `components/PropertyCard.test.tsx`

**Interfaces:**
- Produces: `PropertyCard` signature tidak berubah (`property`, `initialFavorited?`, `variant?: "grid" | "rail"`); `specLine` tetap.

- [ ] **Step 1: Test gagal** — di `components/PropertyCard.test.tsx` ganti test `'reads title, then location, then specs, then price'` dan `'marks a rent price per month'`, lalu tambah dua test:

```tsx
  it('reads type label, then title, location, specs and price', () => {
    const { container } = renderWithSession(
      <PropertyCard property={{ ...mockProperty, address: 'Jl. Melati 5, Kemang' }} />,
    )
    const text = container.textContent ?? ''
    const order = ['Rumah', 'Test Property', 'Jl. Melati 5, Kemang', '3 KT · 2 KM · 100 m²', '1 M'].map(
      (s) => text.indexOf(s),
    )
    expect(order.every((i) => i >= 0)).toBe(true)
    expect([...order].sort((a, b) => a - b)).toEqual(order)
  })

  it('marks a rent price per month in full', () => {
    renderWithSession(
      <PropertyCard property={{ ...mockProperty, listingType: 'sewa', price: '15000000' }} />,
    )
    expect(screen.getByText('/bulan')).toBeInTheDocument()
  })

  it('is flat: no border or shadow around the card', () => {
    const { container } = renderWithSession(<PropertyCard property={mockProperty} />)
    const card = container.firstChild as HTMLElement
    expect(card.className).not.toMatch(/\bborder\b|shadow/)
  })

  it('sets the price in the text colour, not the call-to-action colour', () => {
    renderWithSession(<PropertyCard property={mockProperty} />)
    const price = screen.getByText('1 M').parentElement!
    expect(price.className).toContain('text-foreground')
    expect(price.className).not.toContain('text-primary')
  })
```

- [ ] **Step 2:** `pnpm test components/PropertyCard.test.tsx` → 4 FAIL.

- [ ] **Step 3: `PropertyPills` hanya badge listing** — ganti isi `return (...)`:

```tsx
  return (
    <div className={cn("flex", className)}>
      <Badge className={cn("h-6 bg-white px-2.5 text-[11px] font-bold shadow-sm", isJual ? "text-primary" : "text-accent")}>
        {isJual ? "Dijual" : "Disewa"}
      </Badge>
    </div>
  )
```
dan hapus prop `type` dari interface serta import `PROPERTY_TYPE_LABELS` bila tak terpakai. Pemanggil: `<PropertyPills listingType={property.listingType} />`.

- [ ] **Step 4: `PropertyCard` flat** — tambah import `{ BedDouble, Building2, Home, MessageCircle, Store, Trees }` dari lucide dan `PROPERTY_TYPE_LABELS` dari constants; konstanta ikon:

```tsx
const TYPE_ICONS = { rumah: Home, apartemen: Building2, tanah: Trees, ruko: Store } as const
```

Ganti `return (...)`:

```tsx
  const TypeIcon = TYPE_ICONS[property.type as keyof typeof TYPE_ICONS] ?? Home
  const suffix = price.suffix ? "/bulan" : ""

  return (
    <article className={cn("group relative", variant === "rail" && "w-[260px] shrink-0")}>
      <Link
        href={`/properti/${property.id}`}
        prefetch={false}
        className="block rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-muted">
          {primaryImage ? (
            <Image
              src={primaryImage.url}
              alt={property.title}
              fill
              sizes={SIZES[variant]}
              className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-sm text-muted-foreground/60">
              Tidak ada foto
            </div>
          )}
          <div className="absolute left-2.5 top-2.5">
            <PropertyPills listingType={property.listingType} />
          </div>
        </div>

        <div className="pt-2.5">
          <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <TypeIcon size={13} aria-hidden />
            {PROPERTY_TYPE_LABELS[property.type]}
          </p>
          <h3 className="mt-1 line-clamp-2 text-[15px] font-bold leading-snug text-foreground transition-colors group-hover:text-primary">
            {property.title}
          </h3>
          <p className="mt-0.5 line-clamp-1 text-[13px] text-muted-foreground">
            {property.address ?? property.city}
          </p>
          {specs && (
            <p className="mt-1 flex items-center gap-1.5 text-[13px] text-muted-foreground">
              <BedDouble size={13} aria-hidden />
              {specs}
            </p>
          )}
          {/* Right padding keeps the price clear of the WhatsApp button. */}
          <p className="mt-2 flex items-baseline gap-0.5 pr-11 text-[17px] font-bold leading-none text-foreground">
            <span className="text-[0.7em] font-semibold">{price.prefix}</span>
            <span>{price.value}</span>
            {suffix && <span className="ml-0.5 text-[0.75em] font-normal text-muted-foreground">{suffix}</span>}
          </p>
        </div>
      </Link>

      <div className="absolute right-2.5 top-2.5">
        <FavoriteButton propertyId={property.id} initialFavorited={initialFavorited} />
      </div>

      {whatsappHref && (
        <a
          href={whatsappHref}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Tanya lewat WhatsApp: ${property.title}`}
          className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full bg-accent text-accent-foreground transition-colors hover:bg-primary"
        >
          <MessageCircle size={15} aria-hidden />
        </a>
      )}
    </article>
  )
```

Hapus test lama `'gives the rail variant a fixed width'` tidak perlu — tetap lulus (kelas `w-[260px]` tetap di root).

- [ ] **Step 5:** `pnpm test components/PropertyCard.test.tsx` → PASS. `pnpm typecheck` (PropertyPills tanpa `type`).
- [ ] **Step 6:** commit `feat(card): kartu flat ala Rukita — label tipe berikon, harga hitam, /bulan`.

---

### Task 3: Panel listing bertab

**Files:** Create `components/ui/tabs.tsx` (shadcn), `components/home/ListingPanel.tsx`, `components/home/ListingPanel.test.tsx`; Modify `app/page.tsx`, `lib/brand.ts`

**Interfaces:**
- Consumes: `ListingGroups`, `PANEL_CATEGORIES`, `PanelCategory`, `groupByType` (Task 1); `PropertyCard variant="rail"` (Task 2); `Rail` (`components/home/Rail.tsx`).
- Produces: `default function ListingPanel(props: { groups: { jual: ListingGroups; sewa: ListingGroups }; favoriteIds: string[] })`; `export function panelHref(listingType: "jual" | "sewa", category: PanelCategory): string`; `BRAND.listingPanel: { heading, tabs: { jual, sewa }, empty, seeAll, categories: Record<PanelCategory, string> }`.

- [ ] **Step 1: Tambah Tabs**

```bash
printf 'n\nn\nn\nn\n' | pnpm exec shadcn add tabs --yes
sed -i 's|import { cn } from "cn"|import { cn } from "@/lib/utils"|' components/ui/tabs.tsx
pnpm remove cn
```

Pastikan `git diff package.json` tidak menambah `cn`.

- [ ] **Step 2: Copy di `lib/brand.ts`** — ganti blok `listingRail` dengan:

```ts
  // The tabbed listing panel under the homepage hero.
  listingPanel: {
    heading: "Pilihan Untukmu",
    tabs: { jual: "Dijual", sewa: "Disewa" },
    categories: { semua: "Semua", rumah: "Rumah", apartemen: "Apartemen", tanah: "Tanah", ruko: "Ruko" },
    empty: "Belum ada listing untuk pilihan ini.",
    seeAll: "Lihat Semua",
  },
```

(`BRAND.listingRail` hanya dipakai `app/page.tsx`; dihapus di Step 6. `components/home/rail-chips.ts` `TYPE_CHIPS` ikut tidak terpakai — hapus ekspornya dan test-nya di `ListingRail.test.tsx`.)

- [ ] **Step 3: Test gagal** `components/home/ListingPanel.test.tsx`:

```tsx
import { render, screen, fireEvent, within } from "@testing-library/react"
import { SessionProvider } from "next-auth/react"
import ListingPanel, { panelHref } from "@/components/home/ListingPanel"
import { groupByType } from "@/lib/listing-groups"
import type { PropertyWithImages } from "@/lib/types"

function listing(id: string, type: PropertyWithImages["type"], listingType: "jual" | "sewa"): PropertyWithImages {
  return {
    id, title: `Listing ${id}`, description: null, price: "1000000000", listingType, type,
    city: "Jakarta", address: null, lat: null, lng: null, images: [], bedrooms: null,
    bathrooms: null, buildingArea: null, landArea: null, agentId: null, status: null, createdAt: null,
  }
}

const groups = {
  jual: groupByType([listing("j1", "rumah", "jual"), listing("j2", "ruko", "jual")]),
  sewa: groupByType([listing("s1", "apartemen", "sewa")]),
}

function renderPanel() {
  return render(
    <SessionProvider>
      <ListingPanel groups={groups} favoriteIds={[]} />
    </SessionProvider>,
  )
}

describe("ListingPanel", () => {
  it("opens on Dijual and Semua", () => {
    renderPanel()
    expect(screen.getByRole("tab", { name: "Dijual" })).toHaveAttribute("aria-selected", "true")
    expect(screen.getByRole("radio", { name: "Semua" })).toHaveAttribute("aria-checked", "true")
    expect(screen.getByText("Listing j1")).toBeInTheDocument()
    expect(screen.getByText("Listing j2")).toBeInTheDocument()
  })

  it("switches to rentals in place", () => {
    renderPanel()
    fireEvent.mouseDown(screen.getByRole("tab", { name: "Disewa" }))
    expect(screen.getByText("Listing s1")).toBeInTheDocument()
    expect(screen.queryByText("Listing j1")).not.toBeInTheDocument()
  })

  it("narrows to one property type", () => {
    renderPanel()
    fireEvent.click(screen.getByRole("radio", { name: "Ruko" }))
    expect(screen.getByText("Listing j2")).toBeInTheDocument()
    expect(screen.queryByText("Listing j1")).not.toBeInTheDocument()
  })

  it("says so, and links to the catalog, when a combination has nothing", () => {
    renderPanel()
    fireEvent.click(screen.getByRole("radio", { name: "Tanah" }))
    expect(screen.getByText("Belum ada listing untuk pilihan ini.")).toBeInTheDocument()
    expect(screen.queryByRole("region")).not.toBeInTheDocument()
  })

  it("points Lihat Semua at the catalog filtered the same way", () => {
    renderPanel()
    fireEvent.click(screen.getByRole("radio", { name: "Rumah" }))
    expect(screen.getByRole("link", { name: /lihat semua/i })).toHaveAttribute(
      "href",
      "/properti?listingType=jual&type=rumah",
    )
  })

  it("labels the category row", () => {
    renderPanel()
    expect(within(screen.getByRole("group", { name: "Kategori" })).getAllByRole("radio")).toHaveLength(5)
  })
})

describe("panelHref", () => {
  it("leaves out the type for Semua", () => {
    expect(panelHref("sewa", "semua")).toBe("/properti?listingType=sewa")
    expect(panelHref("jual", "tanah")).toBe("/properti?listingType=jual&type=tanah")
  })
})
```

- [ ] **Step 4:** `pnpm test components/home/ListingPanel.test.tsx` → FAIL (module tidak ada).

- [ ] **Step 5: Implementasi `components/home/ListingPanel.tsx`**

```tsx
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
          <TabsList className="grid h-auto w-full grid-cols-2 rounded-none bg-transparent p-0">
            {(["jual", "sewa"] as const).map((t) => (
              <TabsTrigger
                key={t}
                value={t}
                className="h-14 rounded-none border-0 bg-secondary text-[15px] font-semibold text-muted-foreground shadow-none data-[state=active]:bg-muted data-[state=active]:text-primary data-[state=active]:shadow-none"
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
```

Catatan: Radix Tabs mengganti tab pada `mouseDown` (bukan `click`) — test memakai `fireEvent.mouseDown`. Kalau `TabsTrigger` hasil generate memakai `data-active` alih-alih `data-[state=active]`, sesuaikan selektor kelasnya dengan file `components/ui/tabs.tsx`.

- [ ] **Step 6: `app/page.tsx`** — ganti `newestMatching({})` + rail "Pilihan Untukmu" dengan panel:

```tsx
import ListingPanel from "@/components/home/ListingPanel"
import { groupByType } from "@/lib/listing-groups"
// PANEL_FETCH: enough of each listing type that the smaller types still show
// up in their own category after grouping.
const PANEL_FETCH = 48

function newestMatching(raw: RawCatalogParams, limit = RAIL_SIZE): Promise<PropertyWithImages[]> {
  return getPropertiesWithImagesBatch(
    db.select().from(properties)
      .where(catalogConditions(parseCatalogFilters(raw)))
      .orderBy(...CATALOG_ORDER_BY.terbaru)
      .limit(limit),
  )
}
```

Di `HomePage`:

```tsx
  const [forSale, forRent, budget, session] = await Promise.all([
    newestMatching({ listingType: "jual" }, PANEL_FETCH),
    newestMatching({ listingType: "sewa" }, PANEL_FETCH),
    getBudgetShowcase(),
    getServerSession(authOptions),
  ])
  const favoriteIds = session?.user?.id ? await getFavoritePropertyIds(session.user.id) : new Set<string>()
```

dan render:

```tsx
      <SearchHero />
      <ListingPanel
        groups={{ jual: groupByType(forSale), sewa: groupByType(forRent) }}
        favoriteIds={[...favoriteIds]}
      />
      {budget && ( /* ListingRail budget seperti sekarang */ )}
```

Hapus import `TYPE_CHIPS` dan blok `listingRail` dari `BRAND`; hapus ekspor `TYPE_CHIPS` di `rail-chips.ts` beserta test `"offers every type plus rentals"` dan `"does not announce the type chips…"` di `ListingRail.test.tsx` (ganti `chips={TYPE_CHIPS}` di `renderRail` dengan `budgetChips(BUDGET_RANGES[0])`, dan sesuaikan test `"links every chip to the catalog"` untuk chip budget).

- [ ] **Step 7:** `pnpm test components/home` → PASS; `pnpm typecheck`.
- [ ] **Step 8:** commit `feat(home): panel listing bertab Dijual/Disewa dengan kategori berikon`.

---

### Task 4: Hero full-bleed dengan search pill

**Files:** Modify `components/home/SearchHero.tsx`, `components/home/SearchHero.test.tsx`

**Interfaces:**
- Consumes: `searchHref` (tetap), `BRAND.searchHero` (tambah `placeholderShort: "Cari properti…"` dan `listingPlaceholder: "Dijual/Disewa"` tidak perlu — pakai label Select).
- Produces: `<section id="home">` full-bleed dengan kelas `-mt-16`.

- [ ] **Step 1: Test gagal** — di `SearchHero.test.tsx` ganti dua test ToggleGroup (`"submits the query and the jual/sewa choice…"`, `"offers jual/sewa as a labelled single-choice toggle group…"`) dan test `sizes`, lalu tambah:

```tsx
  it("submits the query from the search pill", () => {
    render(<SearchHero />)
    fireEvent.change(screen.getByRole("searchbox"), { target: { value: "Kemang" } })
    fireEvent.click(screen.getByRole("button", { name: "Cari" }))
    expect(push).toHaveBeenCalledWith("/properti?q=Kemang")
  })

  it("offers jual/sewa as a Select, submitted as blank until chosen", () => {
    const { container } = render(<SearchHero />)
    expect(screen.getByRole("combobox", { name: "Dijual atau disewa" })).toHaveAttribute("data-slot", "select-trigger")
    expect(container.querySelector('input[type="hidden"][name="listingType"]')).toHaveValue("")
  })

  it("runs full-bleed and slides up under the navbar", () => {
    const { container } = render(<SearchHero />)
    expect(container.querySelector("section")!.className).toContain("-mt-16")
    expect(container.querySelector("section")!.className).not.toContain("container")
  })

  it("asks for a photo as wide as the tall phone banner draws it", () => {
    const { container } = render(<SearchHero />)
    expect(container.querySelector("img")?.getAttribute("sizes")).toBe("(max-width: 767px) 840px, 100vw")
  })
```

Ganti juga di test lama nama tombol `"Cari Sekarang"` → `"Cari"` dan `BRAND.searchHero.cta` → `"Cari"`.

- [ ] **Step 2:** `pnpm test components/home/SearchHero.test.tsx` → FAIL.

- [ ] **Step 3: Implementasi** — `BRAND.searchHero.cta: "Cari"`. Ganti `return (...)` dan buang ToggleGroup:

```tsx
  const [type, setType] = useState(ALL)
  const [listingType, setListingType] = useState(ALL)

  return (
    <section
      id="home"
      className="relative -mt-16 h-[520px] overflow-hidden rounded-bl-[2.5rem] bg-accent sm:h-[600px] sm:rounded-bl-[5rem]"
    >
      <Image
        src={searchHero.image}
        alt={searchHero.imageAlt}
        fill
        loading="eager"
        fetchPriority="high"
        // Full-bleed. Below md the banner is taller than a 3:2 photo is wide
        // at that width, so object-cover draws it ~780–840px wide.
        sizes="(max-width: 767px) 840px, 100vw"
        className="object-cover"
      />
      <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/25 to-black/30" />

      <div className="container relative mx-auto flex h-full flex-col justify-end px-4 pb-10 sm:pb-14">
        <h1 className="max-w-2xl text-3xl font-bold leading-tight text-white sm:text-5xl">{searchHero.headline}</h1>
        <p className="mt-2 max-w-xl text-[15px] font-medium text-white/90 sm:text-lg">{searchHero.subtitle}</p>

        <form
          action="/properti"
          method="get"
          onSubmit={(e) => {
            e.preventDefault()
            router.push(searchHref(new FormData(e.currentTarget)))
          }}
          className="mt-6 flex items-center rounded-full bg-background p-1.5 shadow-xl sm:p-2"
        >
          <input type="hidden" name="type" value={type === ALL ? "" : type} />
          <input type="hidden" name="listingType" value={listingType === ALL ? "" : listingType} />

          <label className="relative flex min-w-0 flex-1 items-center">
            <span className="sr-only">Lokasi atau kata kunci</span>
            <MapPin aria-hidden className="pointer-events-none absolute left-4 h-5 w-5 text-muted-foreground" />
            <Input
              name="q"
              type="search"
              placeholder={searchHero.placeholder}
              className="h-11 border-0 bg-transparent pl-12 shadow-none focus-visible:ring-0 sm:h-12"
            />
          </label>

          <div className="hidden items-center sm:flex">
            <span aria-hidden className="h-8 w-px bg-border" />
            <Select value={type} onValueChange={setType}>
              <SelectTrigger aria-label="Tipe properti" className="!h-12 w-40 border-0 shadow-none focus-visible:ring-0">
                <Home aria-hidden className="text-muted-foreground" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>Semua tipe</SelectItem>
                {PROPERTY_TYPES.map((t) => (
                  <SelectItem key={t} value={t}>{PROPERTY_TYPE_LABELS[t]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <span aria-hidden className="h-8 w-px bg-border" />
            <Select value={listingType} onValueChange={setListingType}>
              <SelectTrigger aria-label="Dijual atau disewa" className="!h-12 w-40 border-0 shadow-none focus-visible:ring-0">
                <Tag aria-hidden className="text-muted-foreground" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LISTING_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button type="submit" className="h-11 w-11 shrink-0 px-0 font-semibold sm:h-12 sm:w-auto sm:px-7">
            <Search aria-hidden />
            <span className="sr-only sm:not-sr-only">{searchHero.cta}</span>
          </Button>
        </form>
      </div>
    </section>
  )
```

Import: `{ Home, MapPin, Search, Tag }` dari lucide; buang import `ToggleGroup`. `LISTING_OPTIONS` label "Semua" → "Dijual & disewa".

- [ ] **Step 4:** test → PASS.
- [ ] **Step 5:** commit `feat(home): hero full-bleed melengkung dengan search pill satu baris`.

---

### Task 5: Navbar transparan di atas hero

**Files:** Create `components/navbar/useOverHero.ts`, `components/navbar/__tests__/useOverHero.test.tsx`; Modify `components/Navbar.tsx`, `components/navbar/DesktopNav.tsx`, `components/navbar/MobileNav.tsx`, `components/navbar/UserMenu.tsx`, `components/Navbar.test.tsx`

**Interfaces:**
- Produces: `function useOverHero(pathname: string): boolean`; `DesktopNav` prop `light?: boolean`; `MobileNav` prop `light?: boolean`; `UserMenu` prop `light?: boolean`.

- [ ] **Step 1: Test gagal** `components/navbar/__tests__/useOverHero.test.tsx`:

```tsx
import { act, render } from "@testing-library/react"
import { useOverHero } from "@/components/navbar/useOverHero"

function Probe({ pathname }: { pathname: string }) {
  return <output>{String(useOverHero(pathname))}</output>
}

function hero(bottom: number) {
  document.body.innerHTML = ""
  const el = document.createElement("section")
  el.id = "home"
  el.getBoundingClientRect = () => ({ bottom } as DOMRect)
  document.body.appendChild(el)
  return el
}

describe("useOverHero", () => {
  it("is true on the homepage while the hero is under the bar", () => {
    hero(600)
    const { container } = render(<Probe pathname="/" />)
    expect(container.textContent).toBe("true")
  })

  it("turns false once the hero has scrolled past the bar", () => {
    const el = hero(600)
    const { container } = render(<Probe pathname="/" />)
    el.getBoundingClientRect = () => ({ bottom: 40 } as DOMRect)
    act(() => {
      window.dispatchEvent(new Event("scroll"))
    })
    expect(container.textContent).toBe("false")
  })

  it("is false on every other page", () => {
    hero(600)
    const { container } = render(<Probe pathname="/properti" />)
    expect(container.textContent).toBe("false")
  })

  it("re-measures after client-side navigation back to the homepage", () => {
    const el = hero(600)
    const { container, rerender } = render(<Probe pathname="/" />)
    el.getBoundingClientRect = () => ({ bottom: 40 } as DOMRect)
    act(() => {
      window.dispatchEvent(new Event("scroll"))
    })
    rerender(<Probe pathname="/properti" />)
    el.getBoundingClientRect = () => ({ bottom: 600 } as DOMRect)
    rerender(<Probe pathname="/" />)
    expect(container.textContent).toBe("true")
  })
})
```

Di `components/Navbar.test.tsx`, ganti test `'is solid on the homepage too, with no transparent mode'` dengan:

```tsx
  it('is transparent over the homepage hero, with light text', () => {
    const { container } = renderAt('/')
    const header = container.querySelector('header')!
    expect(header.className).toContain('bg-transparent')
    expect(screen.getByRole('button', { name: 'Produk Trihuni' }).className).toContain('text-white')
  })

  it('is solid on every other page', () => {
    const { container } = renderAt('/properti')
    const header = container.querySelector('header')!
    expect(header.className).toContain('bg-background')
    expect(header.className).not.toContain('bg-transparent')
  })
```

(Di jsdom tanpa `#home`, hook memakai `innerHeight - scrollY` = 768 > 64 → transparan di `/`.)

- [ ] **Step 2:** `pnpm test components/navbar components/Navbar.test.tsx` → FAIL.

- [ ] **Step 3: `components/navbar/useOverHero.ts`**

```ts
"use client"

import { useEffect, useState } from "react"

const BAR_HEIGHT = 64

/**
 * True while the homepage hero is still behind the navbar, so the bar can drop
 * its background and sit on the photograph. Starts true on "/" so the server
 * render matches the first frame instead of flashing a solid bar, and restarts
 * on every pathname change: the navbar lives in the root layout and never
 * remounts, and Beranda is a client-side link.
 */
export function useOverHero(pathname: string): boolean {
  const onHome = pathname === "/"
  const [over, setOver] = useState(true)

  useEffect(() => {
    if (!onHome) return
    // Look the hero up on every check: the homepage streams in behind
    // app/loading.tsx, so the navbar can mount before the hero exists. Until
    // it does, the viewport stands in for it — the hero is the first section.
    const update = () => {
      const hero = document.getElementById("home")
      const bottom = hero ? hero.getBoundingClientRect().bottom : window.innerHeight - window.scrollY
      setOver(bottom > BAR_HEIGHT)
    }
    update()
    window.addEventListener("scroll", update, { passive: true })
    window.addEventListener("resize", update)
    return () => {
      window.removeEventListener("scroll", update)
      window.removeEventListener("resize", update)
      setOver(true)
    }
  }, [onHome])

  return onHome && over
}
```

Jika lint menolak `setOver` di badan effect (`update()` sinkron), bungkus panggilan awal: `const frame = requestAnimationFrame(update)` dan `cancelAnimationFrame(frame)` di cleanup; test pertama lalu memakai `jest.useFakeTimers()` + `act(() => jest.advanceTimersByTime(20))`.

- [ ] **Step 4: Navbar** — di `components/Navbar.tsx`:

```tsx
import { useOverHero } from "@/components/navbar/useOverHero"
import { cn } from "@/lib/utils"
// …
  const overHero = useOverHero(pathname)
// …
    <header
      className={cn(
        "sticky top-0 z-40 border-b transition-colors duration-300",
        overHero ? "border-transparent bg-transparent" : "border-border bg-background",
      )}
    >
      <nav className="container mx-auto flex h-16 items-center justify-between gap-6 px-4">
        <Link href="/" className="shrink-0" aria-label={BRAND.name}>
          <BrandMark size="md" inverted={overHero} />
        </Link>
        <DesktopNav activeGroup={activeGroup} isItemActive={isItemActive} light={overHero} />
        <div className="flex shrink-0 items-center gap-2">
          <UserMenu light={overHero} />
          <MobileNav isItemActive={isItemActive} light={overHero} />
        </div>
      </nav>
    </header>
```

`DesktopNav` — tambah prop `light = false`; trigger:

```tsx
              className={cn(
                "rounded-full px-4",
                light
                  ? activeGroup === group.id
                    ? "bg-white/15 font-bold text-white hover:bg-white/20 hover:text-white"
                    : "bg-transparent font-medium text-white hover:bg-white/10 hover:text-white"
                  : activeGroup === group.id
                    ? "bg-primary/10 font-bold text-primary hover:bg-primary/15"
                    : "font-medium text-foreground/70 hover:text-foreground",
              )}
```

`MobileNav` — prop `light = false`; tombol trigger `className={cn("lg:hidden flex h-9 w-9 items-center justify-center rounded-full transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring", light ? "text-white hover:bg-white/10" : "text-accent hover:bg-muted")}` (import `cn` sudah ada).

`UserMenu` — prop `light = false`; link "Masuk / Daftar" tetap tombol terakota (terbaca di atas foto); trigger avatar: tambah `light ? "hover:bg-white/10" : "hover:bg-muted"` dan chevron `light ? "text-white/80" : "text-foreground/40"`.

- [ ] **Step 5:** `pnpm test components/navbar components/Navbar.test.tsx` → PASS; lint.
- [ ] **Step 6:** commit `feat(navbar): transparan di atas hero homepage, solid setelah lewat`.

---

### Task 6: Dokumentasi dan verifikasi

- [ ] **Step 1: AGENTS.md** — di "Design tokens": ganti "`--primary` is terracotta and drives calls to action, active chips and prices" menjadi "`--primary` is terracotta and drives calls to action and active states; prices are set in the text colour"; ganti deskripsi homepage (`SearchHero` … `ListingRail`s) dengan: full-bleed `SearchHero` (`id="home"`, `-mt-16`, curved bottom-left, one-row search pill; mobile pill is query-only), `ListingPanel` (Dijual|Disewa `Tabs`, category `ToggleGroup`, carousel; data from two queries grouped by `groupByType` in `lib/listing-groups.ts`), then the budget `ListingRail`, `PopularCities`, `BenefitsGrid`, `ContactCta`. Ganti kalimat "The navbar is always solid white…" dengan: "On `/` the navbar is transparent while the hero is behind it (`components/navbar/useOverHero.ts`) and turns solid once it has passed; anything that becomes the first homepage section must slide up under the bar with `-mt-16` or the bar floats white-on-white." Kartu: "flat — no border or shadow; type label with icon, title, location, specs, then the price in the text colour, `/bulan` for rent".
- [ ] **Step 2:** `pnpm lint && pnpm typecheck && pnpm test && pnpm build` → hijau.
- [ ] **Step 3:** dev server + Playwright: homepage 1440 dan 375 (atas, setelah scroll 700px), `/properti` 1440 — bandingkan dengan screenshot Rukita; periksa navbar transparan/solid, tab dan kategori berganti, tidak ada scroll horizontal di 375.
- [ ] **Step 4:** commit `docs(agents): hero full-bleed, panel bertab, kartu flat, navbar transparan`.
