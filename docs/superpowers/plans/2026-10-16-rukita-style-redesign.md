# Redesign Gaya Marketplace ala Rukita — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Mengubah TRIHUNI dari homepage brosur sinematik menjadi marketplace properti yang padat dan cerah ala Rukita — hero pencarian, rail listing dengan chip, tile kota, grid keuntungan — dengan satu `PropertyCard` baru dan katalog berfilter horizontal.

**Architecture:** Homepage tetap server component (`revalidate = 60`) yang menyusun komponen presentasional baru di `components/home/`; data tetap lewat `getPropertiesWithImagesBatch` dan filter tetap lewat `lib/catalog-query.ts`. Rentang budget didefinisikan sekali di `lib/budget-ranges.ts` (pure). Mesin motion (Lenis/GSAP/IntroLoader) dan section brosur dihapus seluruhnya; token di `app/globals.css` disetel ulang sehingga halaman lain ikut berubah tanpa dirombak.

**Tech Stack:** Next.js 16 App Router, React 19, Tailwind CSS v4, shadcn/ui, Drizzle + Neon, Jest + Testing Library (jsdom), lucide-react.

**Spec:** `docs/superpowers/specs/2026-10-14-rukita-style-redesign-design.md`

## Global Constraints

- Gaya saja, bukan aset: tidak ada logo, foto, ikon, atau copy Rukita.
- Tidak ada perubahan skema database (DB dipakai bersama `next-property-catalog`).
- Tidak ada section promo/harga coret, penghargaan, liputan media, download app.
- Semua brand string lewat `lib/brand.ts` (`BRAND`); jangan hard-code nama brand di komponen.
- Listing untuk grid/rail hanya lewat `getPropertiesWithImagesBatch`; filter hanya lewat `parseCatalogFilters` + `catalogConditions`.
- Link WhatsApp hanya lewat `buildWhatsAppLink` / `buildAgentWhatsAppLink`, tidak pernah `wa.me` manual.
- Palet tetap: terakota `#C06A14` (`--primary`), cokelat tua `#4A2E1C` (`--accent`), gold `#D6A76A` (`--gold`), near-black `#1B1B1B`.
- `--radius: 0.75rem`. Tombol dan chip `rounded-full`. Kartu `rounded-xl`.
- Plus Jakarta Sans saja, bobot 400–700 (jangan `font-light` / `font-extrabold`).
- Hanya foto hero yang `loading="eager"` + `fetchPriority="high"`; semua foto lain lazy (default Next). `sizes` = lebar gambar yang *digambar*.
- Tanpa `backdrop-blur`.
- Urutan verifikasi: `pnpm lint → pnpm typecheck → pnpm test → pnpm build`.
- Commit message berbahasa Indonesia gaya repo (`feat(home): ...`), diakhiri `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.

## Review Focus

1. **Harga tepat di batas budget (mis. Rp 500.000.000)** → listing muncul di tepat satu rentang, bukan dua. Diuji di Task 1.
2. **Homepage tanpa listing aktif sama sekali** → rail "Pilihan Untukmu" menampilkan pesan kosong, section budget tidak dirender, halaman tidak error. Diuji di Task 4 (ListingRail kosong) dan Task 6 (budget `null`).
3. **Pencarian hero berisi spasi saja / semua field kosong** → menuju `/properti` polos, bukan `/properti?q=+&type=`. Diuji di Task 3.
4. **Listing tanpa foto, atau tanah tanpa luas tanah** → kartu menampilkan placeholder "Tidak ada foto" dan tidak ada baris spek kosong. Diuji di Task 2.
5. **Menu "Kontak" dari halaman selain homepage** → `/#contact` mendarat di band CTA homepage yang benar-benar punya `id="contact"`. Diuji di Task 5 (ContactCta id) dan Task 8 (NAV_LINKS).

---

## File Structure

**Dibuat**
- `lib/budget-ranges.ts` — definisi rentang harga jual + helper URL. Pure.
- `lib/__tests__/budget-ranges.test.ts`
- `components/home/SearchHero.tsx` — hero foto + form pencarian (client).
- `components/home/SearchHero.test.tsx`
- `components/home/Chip.tsx` — chip link pill.
- `components/home/Rail.tsx` — kontainer scroll horizontal + tombol panah (client).
- `components/home/ListingRail.tsx` — judul + chip + rail `PropertyCard`.
- `components/home/rail-chips.ts` — data chip tipe & budget.
- `components/home/ListingRail.test.tsx`
- `components/home/BenefitsGrid.tsx`, `components/home/BenefitsGrid.test.tsx`
- `components/home/ContactCta.tsx`, `components/home/ContactCta.test.tsx`

**Diubah**
- `app/globals.css`, `app/layout.tsx`, `app/page.tsx`
- `components/ui/button.tsx`
- `components/PropertyCard.tsx`, `components/PropertyCard.test.tsx`, `components/PropertyPills.tsx`
- `components/PopularCities.tsx`, `components/SectionHeading.tsx`, `components/Reveal.tsx`, `components/Reveal.test.tsx`
- `components/Navbar.tsx`, `components/navbar/{DesktopNav,MobileNav,UserMenu,nav-links}.tsx|ts`, `components/navbar/__tests__/nav-links.test.ts`, `components/Navbar.test.tsx`
- `components/Footer.tsx`
- `components/PropertyFilter.tsx`, `app/properti/page.tsx`, `components/CatalogViewToggle.tsx`
- `app/agen/[id]/page.tsx`, `app/profil/page.tsx`
- `lib/brand.ts`, `AGENTS.md`, `package.json` / `pnpm-lock.yaml`

**Dihapus**
- `components/{IntroLoader,HomeMotion,HeroSection,AboutSection,HowWeWork,ManifestoBand,HomeListingCard,ExploreTypes,ContactSection}.tsx` beserta `*.test.tsx`-nya
- `components/navbar/useOverHero.ts`, `components/navbar/__tests__/useOverHero.test.tsx`
- `public/hero.av1.mp4`, `public/hero.mp4`, `public/hero.webm` (hanya dipakai `HeroSection`)
- Dependency `gsap`, `@gsap/react`, `lenis`

> Penyimpangan kecil dari spec, disengaja: spec menyebut `BudgetRail.tsx` terpisah; plan ini memakai satu `ListingRail` untuk kedua rail (bedanya hanya data chip), supaya tidak ada dua komponen hampir identik. `TILE_SIZES` di `PopularCities` diganti satu nilai `sizes` karena parallax (alasan nilai-nilai itu) ikut hilang.

---

### Task 0: Branch kerja

- [ ] **Step 1: Buat branch dari master terbaru**

```bash
git switch master
git pull --ff-only
git switch -c feat/rukita-style
```

Expected: `Switched to a new branch 'feat/rukita-style'`.

---

### Task 1: Rentang budget (`lib/budget-ranges.ts`)

**Files:**
- Create: `lib/budget-ranges.ts`
- Test: `lib/__tests__/budget-ranges.test.ts`

**Interfaces:**
- Consumes: `parseCatalogFilters`, `RawCatalogParams` dari `@/lib/catalog-query`.
- Produces:
  - `interface BudgetRange { id: string; label: string; min?: number; max?: number }`
  - `const BUDGET_RANGES: readonly BudgetRange[]`
  - `function budgetParams(range: BudgetRange): RawCatalogParams`
  - `function budgetHref(range: BudgetRange): string`

- [ ] **Step 1: Tulis test yang gagal**

`lib/__tests__/budget-ranges.test.ts`:

```ts
import { BUDGET_RANGES, budgetHref, budgetParams } from "@/lib/budget-ranges"
import { parseCatalogFilters } from "@/lib/catalog-query"

/** Whether a price passes a range's bounds the way catalogConditions applies them (gte / lte). */
function inRange(price: number, raw: ReturnType<typeof budgetParams>): boolean {
  const f = parseCatalogFilters(raw)
  if (f.minPrice && price < Number(f.minPrice)) return false
  if (f.maxPrice && price > Number(f.maxPrice)) return false
  return true
}

describe("BUDGET_RANGES", () => {
  it("covers sale listings only", () => {
    for (const range of BUDGET_RANGES) {
      expect(budgetParams(range).listingType).toBe("jual")
    }
  })

  it("puts every price, boundaries included, in exactly one range", () => {
    const prices = [
      0, 1, 499_999_999, 500_000_000, 500_000_001, 999_999_999, 1_000_000_000,
      2_999_999_999, 3_000_000_000, 25_000_000_000,
    ]
    for (const price of prices) {
      const hits = BUDGET_RANGES.filter((r) => inRange(price, budgetParams(r)))
      expect({ price, hits: hits.length }).toEqual({ price, hits: 1 })
    }
  })

  it("produces bounds that parseCatalogFilters accepts unchanged", () => {
    for (const range of BUDGET_RANGES) {
      const raw = budgetParams(range)
      const f = parseCatalogFilters(raw)
      expect(f.minPrice).toBe(raw.minPrice)
      expect(f.maxPrice).toBe(raw.maxPrice)
      expect(f.listingType).toBe("jual")
    }
  })

  it("has unique ids", () => {
    const ids = BUDGET_RANGES.map((r) => r.id)
    expect(new Set(ids).size).toBe(ids.length)
  })
})

describe("budgetHref", () => {
  it("links the cheapest range with only an upper bound", () => {
    expect(budgetHref(BUDGET_RANGES[0])).toBe("/properti?listingType=jual&maxPrice=499999999")
  })

  it("links the top range with only a lower bound", () => {
    expect(budgetHref(BUDGET_RANGES[BUDGET_RANGES.length - 1])).toBe(
      "/properti?listingType=jual&minPrice=3000000000",
    )
  })
})
```

- [ ] **Step 2: Jalankan, pastikan gagal**

Run: `pnpm test lib/__tests__/budget-ranges.test.ts`
Expected: FAIL — `Cannot find module '@/lib/budget-ranges'`.

- [ ] **Step 3: Implementasi**

`lib/budget-ranges.ts`:

```ts
import type { RawCatalogParams } from "@/lib/catalog-query"

/**
 * A price band on the homepage's "Cari sesuai budgetmu" rail. Sale listings
 * only: a monthly rent and a purchase price do not share a scale.
 *
 * `catalogConditions` applies both bounds inclusively (gte / lte), so each
 * upper bound stops one rupiah short of the next band's lower bound — a listing
 * at exactly Rp 500 jt belongs to one band, not two.
 */
export interface BudgetRange {
  id: string
  label: string
  /** Whole rupiah, inclusive. */
  min?: number
  /** Whole rupiah, inclusive. */
  max?: number
}

const JUTA = 1_000_000
const MILIAR = 1_000_000_000

export const BUDGET_RANGES: readonly BudgetRange[] = [
  { id: "lt-500jt", label: "< Rp 500 jt", max: 500 * JUTA - 1 },
  { id: "500jt-1m", label: "Rp 500 jt – 1 M", min: 500 * JUTA, max: 1 * MILIAR - 1 },
  { id: "1m-3m", label: "Rp 1 – 3 M", min: 1 * MILIAR, max: 3 * MILIAR - 1 },
  { id: "gt-3m", label: "> Rp 3 M", min: 3 * MILIAR },
]

/** The catalog filter for a band, in the same shape the URL carries. */
export function budgetParams(range: BudgetRange): RawCatalogParams {
  const raw: RawCatalogParams = { listingType: "jual" }
  if (range.min !== undefined) raw.minPrice = String(range.min)
  if (range.max !== undefined) raw.maxPrice = String(range.max)
  return raw
}

/** The catalog page for a band. */
export function budgetHref(range: BudgetRange): string {
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(budgetParams(range))) {
    if (value) params.set(key, value)
  }
  return `/properti?${params.toString()}`
}
```

- [ ] **Step 4: Jalankan, pastikan lulus**

Run: `pnpm test lib/__tests__/budget-ranges.test.ts`
Expected: PASS, 6 tests.

- [ ] **Step 5: Commit**

```bash
git add lib/budget-ranges.ts lib/__tests__/budget-ranges.test.ts
git commit -m "feat(home): rentang budget harga jual untuk rail homepage

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 2: PropertyCard ala Rukita

**Files:**
- Modify: `components/PropertyCard.tsx` (tulis ulang)
- Modify: `components/PropertyPills.tsx` (gaya pill putih)
- Test: `components/PropertyCard.test.tsx`

**Interfaces:**
- Consumes: `formatPriceCompactValue`, `SITE_URL` (`@/lib/constants`), `buildWhatsAppLink`, `FavoriteButton`, `PropertyPills`.
- Produces:
  - `default function PropertyCard(props: { property: PropertyWithImages; initialFavorited?: boolean; variant?: "grid" | "rail" })`
  - `export function specLine(property: Pick<PropertyWithImages, "type" | "bedrooms" | "bathrooms" | "buildingArea" | "landArea">): string | null`

- [ ] **Step 1: Tambah test yang gagal**

Tambahkan ke akhir `components/PropertyCard.test.tsx` (pertahankan test yang sudah ada; ubah import baris kedua jadi `import PropertyCard, { specLine } from '@/components/PropertyCard'`):

```tsx
describe('PropertyCard layout', () => {
  it('reads title, then location, then specs, then price', () => {
    const { container } = renderWithSession(
      <PropertyCard property={{ ...mockProperty, address: 'Jl. Melati 5, Kemang' }} />,
    )
    const text = container.textContent ?? ''
    const order = ['Test Property', 'Jl. Melati 5, Kemang', '3 KT · 2 KM · 100 m²', '1 M'].map((s) =>
      text.indexOf(s),
    )
    expect(order.every((i) => i >= 0)).toBe(true)
    expect([...order].sort((a, b) => a - b)).toEqual(order)
  })

  it('falls back to the city when there is no address', () => {
    renderWithSession(<PropertyCard property={mockProperty} />)
    expect(screen.getByText('Jakarta')).toBeInTheDocument()
  })

  it('marks a rent price per month', () => {
    renderWithSession(
      <PropertyCard property={{ ...mockProperty, listingType: 'sewa', price: '15000000' }} />,
    )
    expect(screen.getByText('/bln')).toBeInTheDocument()
  })

  it('shows a placeholder instead of a broken image when there is no photo', () => {
    const { container } = renderWithSession(<PropertyCard property={{ ...mockProperty, images: [] }} />)
    expect(screen.getByText('Tidak ada foto')).toBeInTheDocument()
    expect(container.querySelector('img')).toBeNull()
  })

  it('gives the rail variant a fixed width so the rail can scroll', () => {
    const { container } = renderWithSession(<PropertyCard property={mockProperty} variant="rail" />)
    expect((container.firstChild as HTMLElement).className).toContain('w-[260px]')
  })
})

describe('specLine', () => {
  it('joins rooms and building area', () => {
    expect(specLine(mockProperty)).toBe('3 KT · 2 KM · 100 m²')
  })

  it('shows land area alone for tanah', () => {
    expect(specLine({ ...mockProperty, type: 'tanah' })).toBe('LT 200 m²')
  })

  it('is null for tanah without a land area, so no empty row renders', () => {
    expect(specLine({ ...mockProperty, type: 'tanah', landArea: null })).toBeNull()
  })

  it('is null when a building has no specs at all', () => {
    expect(
      specLine({ ...mockProperty, bedrooms: null, bathrooms: null, buildingArea: null }),
    ).toBeNull()
  })

  it('skips only the missing parts', () => {
    expect(specLine({ ...mockProperty, bathrooms: null })).toBe('3 KT · 100 m²')
  })
})
```

- [ ] **Step 2: Jalankan, pastikan gagal**

Run: `pnpm test components/PropertyCard.test.tsx`
Expected: FAIL — `specLine` is not a function / urutan tidak sesuai.

- [ ] **Step 3: Tulis ulang `components/PropertyCard.tsx`**

```tsx
import Link from "next/link"
import Image from "next/image"
import { MessageCircle } from "lucide-react"
import type { PropertyWithImages } from "@/lib/types"
import { formatPriceCompactValue, SITE_URL } from "@/lib/constants"
import { BRAND } from "@/lib/brand"
import { buildWhatsAppLink } from "@/lib/whatsapp"
import { cn } from "@/lib/utils"
import PropertyPills from "@/components/PropertyPills"
import FavoriteButton from "@/components/FavoriteButton"

type CardVariant = "grid" | "rail"

// The width each photo is drawn at. Grid: 1 / 2 / 3 / 4 columns at the catalog
// breakpoints. Rail: a fixed 260px card.
const SIZES: Record<CardVariant, string> = {
  grid: "(max-width: 639px) 100vw, (max-width: 1023px) 50vw, (max-width: 1279px) 33vw, 25vw",
  rail: "260px",
}

/** "3 KT · 2 KM · 120 m²", or "LT 200 m²" for land — null when there is nothing to show. */
export function specLine(
  p: Pick<PropertyWithImages, "type" | "bedrooms" | "bathrooms" | "buildingArea" | "landArea">,
): string | null {
  if (p.type === "tanah") return p.landArea != null ? `LT ${p.landArea} m²` : null
  const parts = [
    p.bedrooms != null ? `${p.bedrooms} KT` : null,
    p.bathrooms != null ? `${p.bathrooms} KM` : null,
    p.buildingArea != null ? `${p.buildingArea} m²` : null,
  ].filter(Boolean)
  return parts.length > 0 ? parts.join(" · ") : null
}

export default function PropertyCard({
  property,
  initialFavorited = false,
  variant = "grid",
}: {
  property: PropertyWithImages
  initialFavorited?: boolean
  variant?: CardVariant
}) {
  const primaryImage = property.images.find((i) => i.isPrimary) ?? property.images[0]
  const price = formatPriceCompactValue(property.price, property.listingType)
  const specs = specLine(property)

  const whatsappHref = buildWhatsAppLink({
    title: property.title,
    price: property.price,
    listingType: property.listingType,
    url: `${SITE_URL}/properti/${property.id}`,
    agentPhone: property.agentPhone,
    officePhone: BRAND.contact.whatsapp,
  })

  return (
    <article
      className={cn(
        "group relative overflow-hidden rounded-xl border border-border/70 bg-card shadow-sm transition-shadow duration-200 hover:shadow-lg",
        variant === "rail" && "w-[260px] shrink-0 snap-start",
      )}
    >
      <Link
        href={`/properti/${property.id}`}
        prefetch={false}
        className="block outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
      >
        <div className="relative aspect-[4/3] bg-muted">
          {primaryImage ? (
            <Image
              src={primaryImage.url}
              alt={property.title}
              fill
              sizes={SIZES[variant]}
              className="object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-sm text-muted-foreground/60">
              Tidak ada foto
            </div>
          )}
          <div className="absolute left-2.5 top-2.5">
            <PropertyPills listingType={property.listingType} type={property.type} />
          </div>
        </div>

        <div className="p-3.5">
          <h3 className="line-clamp-2 min-h-[2.6rem] text-[15px] font-semibold leading-snug text-foreground">
            {property.title}
          </h3>
          <p className="mt-1 line-clamp-1 text-[13px] text-muted-foreground">
            {property.address ?? property.city}
          </p>
          {specs && <p className="mt-0.5 text-[13px] text-muted-foreground">{specs}</p>}
          {/* Right padding keeps the price clear of the WhatsApp button. */}
          <p className="mt-2.5 flex items-baseline gap-0.5 pr-11 text-lg font-bold leading-none text-primary">
            <span className="text-[0.7em] font-semibold">{price.prefix}</span>
            <span>{price.value}</span>
            {price.suffix && <span className="text-[0.7em] font-medium">{price.suffix}</span>}
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
          className="absolute bottom-3 right-3 flex h-9 w-9 items-center justify-center rounded-full bg-accent text-accent-foreground transition-colors hover:bg-primary"
        >
          <MessageCircle size={16} aria-hidden />
        </a>
      )}
    </article>
  )
}
```

- [ ] **Step 4: Ubah `components/PropertyPills.tsx` ke pill putih**

Ganti seluruh isi `return (...)`:

```tsx
  return (
    <div className={cn("flex gap-1.5", className)}>
      <span
        className={cn(
          "inline-flex items-center rounded-full bg-white px-2.5 py-[3px] text-[11px] font-bold shadow-sm",
          isJual ? "text-primary" : "text-accent",
        )}
      >
        {isJual ? "Dijual" : "Disewa"}
      </span>
      <span className="inline-flex items-center rounded-full bg-white px-2.5 py-[3px] text-[11px] font-semibold text-foreground shadow-sm">
        {PROPERTY_TYPE_LABELS[type]}
      </span>
    </div>
  )
```

- [ ] **Step 5: Jalankan, pastikan lulus**

Run: `pnpm test components/PropertyCard.test.tsx`
Expected: PASS (test lama + 10 test baru).

- [ ] **Step 6: Commit**

```bash
git add components/PropertyCard.tsx components/PropertyCard.test.tsx components/PropertyPills.tsx
git commit -m "feat(card): PropertyCard gaya marketplace — judul, lokasi, spek, lalu harga

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 3: Hero pencarian (`SearchHero`)

**Files:**
- Create: `components/home/SearchHero.tsx`
- Test: `components/home/SearchHero.test.tsx`
- Modify: `lib/brand.ts` (tambah `searchHero`)

**Interfaces:**
- Consumes: `PROPERTY_TYPES`, `PROPERTY_TYPE_LABELS` (`@/lib/constants`).
- Produces:
  - `default function SearchHero()` — `<section id="home">`.
  - `export function searchHref(form: FormData): string`
  - `BRAND.searchHero: { headline, subtitle, placeholder, cta, image, imageAlt }`

- [ ] **Step 1: Tambah `searchHero` ke `lib/brand.ts`**

Sisipkan tepat sebelum blok `hero: {` (blok `hero` lama dihapus di Task 6):

```ts
  // Homepage search hero: a rounded banner photograph with the search form on it.
  searchHero: {
    headline: "Temukan properti impianmu di seluruh Indonesia",
    subtitle: "Rumah, apartemen, tanah, dan ruko — dijual dan disewakan langsung oleh agen terpercaya.",
    placeholder: "Cari kota, area, atau nama properti",
    cta: "Cari Sekarang",
    image:
      "https://images.unsplash.com/photo-1646928229117-08e84cde1692?auto=format&fit=crop&w=2000&q=80",
    imageAlt: "Rumah di tengah hutan tropis",
  },
```

- [ ] **Step 2: Tulis test yang gagal**

`components/home/SearchHero.test.tsx`:

```tsx
import { render, screen, fireEvent } from "@testing-library/react"
import SearchHero, { searchHref } from "@/components/home/SearchHero"

const push = jest.fn()
jest.mock("next/navigation", () => ({ useRouter: () => ({ push }) }))

function formData(entries: Record<string, string>) {
  const fd = new FormData()
  for (const [k, v] of Object.entries(entries)) fd.set(k, v)
  return fd
}

describe("searchHref", () => {
  it("goes to the bare catalog when every field is blank", () => {
    expect(searchHref(formData({ q: "", type: "", listingType: "" }))).toBe("/properti")
  })

  it("treats a whitespace-only query as blank", () => {
    expect(searchHref(formData({ q: "   ", type: "", listingType: "" }))).toBe("/properti")
  })

  it("trims the query and keeps only filled fields", () => {
    expect(searchHref(formData({ q: "  Bandung ", type: "rumah", listingType: "" }))).toBe(
      "/properti?q=Bandung&type=rumah",
    )
  })

  it("carries jual/sewa", () => {
    expect(searchHref(formData({ q: "", type: "", listingType: "sewa" }))).toBe(
      "/properti?listingType=sewa",
    )
  })
})

describe("SearchHero", () => {
  beforeEach(() => push.mockClear())

  it("is the homepage's #home section", () => {
    const { container } = render(<SearchHero />)
    expect(container.querySelector("section")).toHaveAttribute("id", "home")
  })

  it("submits the filled fields to the catalog", () => {
    render(<SearchHero />)
    fireEvent.change(screen.getByRole("searchbox"), { target: { value: "Kemang" } })
    fireEvent.change(screen.getByRole("combobox"), { target: { value: "apartemen" } })
    fireEvent.click(screen.getByRole("radio", { name: "Disewa" }))
    fireEvent.click(screen.getByRole("button", { name: "Cari Sekarang" }))
    expect(push).toHaveBeenCalledWith("/properti?q=Kemang&type=apartemen&listingType=sewa")
  })

  it("works as a plain GET form without JavaScript", () => {
    const { container } = render(<SearchHero />)
    const form = container.querySelector("form")!
    expect(form).toHaveAttribute("action", "/properti")
    expect(form).toHaveAttribute("method", "get")
  })
})
```

- [ ] **Step 3: Jalankan, pastikan gagal**

Run: `pnpm test components/home/SearchHero.test.tsx`
Expected: FAIL — `Cannot find module '@/components/home/SearchHero'`.

- [ ] **Step 4: Implementasi `components/home/SearchHero.tsx`**

```tsx
"use client"

import Image from "next/image"
import { useRouter } from "next/navigation"
import { Search } from "lucide-react"
import { BRAND } from "@/lib/brand"
import { PROPERTY_TYPES, PROPERTY_TYPE_LABELS } from "@/lib/constants"

const SEARCH_FIELDS = ["q", "type", "listingType"] as const

/** The catalog URL for a hero search, leaving out every field left blank. */
export function searchHref(form: FormData): string {
  const params = new URLSearchParams()
  for (const key of SEARCH_FIELDS) {
    const value = String(form.get(key) ?? "").trim()
    if (value) params.set(key, value)
  }
  const query = params.toString()
  return query ? `/properti?${query}` : "/properti"
}

const LISTING_OPTIONS = [
  { value: "", label: "Semua" },
  { value: "jual", label: "Dijual" },
  { value: "sewa", label: "Disewa" },
]

const FIELD =
  "h-12 w-full rounded-full border border-border bg-background text-sm text-foreground outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"

/**
 * The homepage's opening section. A plain GET form, so it searches without
 * JavaScript too; with it, blank fields are left out of the URL.
 */
export default function SearchHero() {
  const router = useRouter()
  const { searchHero } = BRAND

  return (
    <section id="home" className="container mx-auto px-4 pt-4 sm:pt-6">
      <div className="relative overflow-hidden rounded-2xl bg-accent">
        <Image
          src={searchHero.image}
          alt={searchHero.imageAlt}
          fill
          loading="eager"
          fetchPriority="high"
          sizes="(max-width: 1535px) 100vw, 1504px"
          className="object-cover"
        />
        <div aria-hidden className="absolute inset-0 bg-gradient-to-r from-black/65 via-black/35 to-black/10" />

        <div className="relative px-5 py-12 sm:px-10 sm:py-16 lg:py-20">
          <h1 className="max-w-2xl text-3xl font-bold leading-tight text-white sm:text-4xl lg:text-5xl">
            {searchHero.headline}
          </h1>
          <p className="mt-3 max-w-xl text-[15px] text-white/85 sm:text-base">{searchHero.subtitle}</p>

          <form
            action="/properti"
            method="get"
            onSubmit={(e) => {
              e.preventDefault()
              router.push(searchHref(new FormData(e.currentTarget)))
            }}
            className="mt-8 rounded-2xl bg-background p-3 shadow-lg sm:p-4 lg:max-w-4xl"
          >
            <fieldset className="mb-3 flex gap-2">
              <legend className="sr-only">Dijual atau disewa</legend>
              {LISTING_OPTIONS.map((o) => (
                <label key={o.label} className="cursor-pointer">
                  <input
                    type="radio"
                    name="listingType"
                    value={o.value}
                    defaultChecked={o.value === ""}
                    className="peer sr-only"
                  />
                  <span className="inline-flex h-8 items-center rounded-full border border-border px-4 text-[13px] font-medium text-muted-foreground transition-colors peer-checked:border-primary peer-checked:bg-primary peer-checked:text-primary-foreground peer-focus-visible:ring-2 peer-focus-visible:ring-ring">
                    {o.label}
                  </span>
                </label>
              ))}
            </fieldset>

            <div className="flex flex-col gap-2 sm:flex-row">
              <label className="relative flex-1">
                <span className="sr-only">Lokasi atau kata kunci</span>
                <Search
                  aria-hidden
                  className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                />
                <input name="q" type="search" placeholder={searchHero.placeholder} className={`${FIELD} pl-10 pr-4`} />
              </label>
              <label className="sm:w-44">
                <span className="sr-only">Tipe properti</span>
                <select name="type" defaultValue="" className={`${FIELD} px-4`}>
                  <option value="">Semua tipe</option>
                  {PROPERTY_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {PROPERTY_TYPE_LABELS[t]}
                    </option>
                  ))}
                </select>
              </label>
              <button
                type="submit"
                className="h-12 rounded-full bg-primary px-7 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
              >
                {searchHero.cta}
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 5: Jalankan, pastikan lulus**

Run: `pnpm test components/home/SearchHero.test.tsx`
Expected: PASS, 7 tests.

- [ ] **Step 6: Commit**

```bash
git add components/home/SearchHero.tsx components/home/SearchHero.test.tsx lib/brand.ts
git commit -m "feat(home): hero pencarian dengan tipe dan jual/sewa

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 4: Rail listing dengan chip (`ListingRail`)

**Files:**
- Create: `components/home/Chip.tsx`, `components/home/Rail.tsx`, `components/home/ListingRail.tsx`, `components/home/rail-chips.ts`
- Test: `components/home/ListingRail.test.tsx`
- Modify: `lib/brand.ts` (tambah `listingRail`, `budgetRail`)

**Interfaces:**
- Consumes: `PropertyCard` (Task 2, `variant="rail"`), `BUDGET_RANGES`, `budgetHref`, `BudgetRange` (Task 1).
- Produces:
  - `interface RailChip { label: string; href: string; active?: boolean }` (dari `ListingRail.tsx`)
  - `default function ListingRail(props: { heading: string; subheading?: string; chips: readonly RailChip[]; properties: PropertyWithImages[]; favoriteIds: ReadonlySet<string>; seeAllHref: string; className?: string })`
  - `const TYPE_CHIPS: readonly RailChip[]`, `function budgetChips(shown: BudgetRange): RailChip[]` (dari `rail-chips.ts`)
  - `BRAND.listingRail: { heading, subheading }`, `BRAND.budgetRail: { heading }`

- [ ] **Step 1: Tambah copy ke `lib/brand.ts`**

Sisipkan setelah blok `searchHero`:

```ts
  listingRail: {
    heading: "Pilihan Untukmu",
    subheading: "Listing terbaru dari agen kami",
  },

  budgetRail: {
    heading: "Cari sesuai budgetmu",
  },
```

- [ ] **Step 2: Tulis test yang gagal**

`components/home/ListingRail.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react"
import { SessionProvider } from "next-auth/react"
import ListingRail from "@/components/home/ListingRail"
import { TYPE_CHIPS, budgetChips } from "@/components/home/rail-chips"
import { BUDGET_RANGES } from "@/lib/budget-ranges"
import type { PropertyWithImages } from "@/lib/types"

const listing: PropertyWithImages = {
  id: "p1",
  title: "Rumah Kemang",
  description: null,
  price: "2500000000",
  listingType: "jual",
  type: "rumah",
  city: "Jakarta",
  address: null,
  lat: null,
  lng: null,
  images: [],
  bedrooms: 3,
  bathrooms: 2,
  buildingArea: 120,
  landArea: 150,
  agentId: null,
  status: null,
  createdAt: null,
}

function renderRail(properties: PropertyWithImages[]) {
  return render(
    <SessionProvider>
      <ListingRail
        heading="Pilihan Untukmu"
        chips={TYPE_CHIPS}
        properties={properties}
        favoriteIds={new Set()}
        seeAllHref="/properti"
      />
    </SessionProvider>,
  )
}

describe("ListingRail", () => {
  it("says so instead of rendering an empty rail when there are no listings", () => {
    renderRail([])
    expect(screen.getByText("Belum ada listing aktif saat ini.")).toBeInTheDocument()
    expect(screen.queryByRole("region")).not.toBeInTheDocument()
  })

  it("renders each listing as a card inside a scrollable region", () => {
    renderRail([listing, { ...listing, id: "p2", title: "Apartemen Sudirman" }])
    const region = screen.getByRole("region", { name: "Pilihan Untukmu" })
    expect(region).toHaveTextContent("Rumah Kemang")
    expect(region).toHaveTextContent("Apartemen Sudirman")
  })

  it("links every chip to the catalog", () => {
    renderRail([listing])
    for (const chip of TYPE_CHIPS) {
      expect(screen.getByRole("link", { name: chip.label })).toHaveAttribute("href", chip.href)
    }
  })

  it("has a see-all link", () => {
    renderRail([listing])
    expect(screen.getByRole("link", { name: /lihat semua/i })).toHaveAttribute("href", "/properti")
  })
})

describe("chips", () => {
  it("offers every type plus rentals", () => {
    expect(TYPE_CHIPS.map((c) => c.href)).toEqual([
      "/properti",
      "/properti?type=rumah",
      "/properti?type=apartemen",
      "/properti?type=tanah",
      "/properti?type=ruko",
      "/properti?listingType=sewa",
    ])
  })

  it("marks only the budget range being shown", () => {
    const chips = budgetChips(BUDGET_RANGES[2])
    expect(chips.filter((c) => c.active).map((c) => c.label)).toEqual([BUDGET_RANGES[2].label])
    expect(chips).toHaveLength(BUDGET_RANGES.length)
  })
})
```

- [ ] **Step 3: Jalankan, pastikan gagal**

Run: `pnpm test components/home/ListingRail.test.tsx`
Expected: FAIL — module tidak ditemukan.

- [ ] **Step 4: Implementasi `components/home/Chip.tsx`**

```tsx
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
```

- [ ] **Step 5: Implementasi `components/home/Rail.tsx`**

```tsx
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
        className="-mx-4 flex snap-x snap-mandatory scroll-px-4 gap-4 overflow-x-auto px-4 pb-3 outline-none [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
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
```

- [ ] **Step 6: Implementasi `components/home/ListingRail.tsx`**

```tsx
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import PropertyCard from "@/components/PropertyCard"
import Chip from "@/components/home/Chip"
import Rail from "@/components/home/Rail"
import type { PropertyWithImages } from "@/lib/types"
import { cn } from "@/lib/utils"

export interface RailChip {
  label: string
  href: string
  active?: boolean
}

interface ListingRailProps {
  heading: string
  subheading?: string
  chips: readonly RailChip[]
  properties: PropertyWithImages[]
  favoriteIds: ReadonlySet<string>
  seeAllHref: string
  className?: string
}

/** A homepage section: heading, a row of filter chips, and a scrolling row of listings. */
export default function ListingRail({
  heading,
  subheading,
  chips,
  properties,
  favoriteIds,
  seeAllHref,
  className,
}: ListingRailProps) {
  return (
    <section className={cn("container mx-auto px-4 py-10 sm:py-12", className)}>
      <div className="mb-4 flex items-end justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-accent sm:text-2xl">{heading}</h2>
          {subheading && <p className="mt-1 text-sm text-muted-foreground">{subheading}</p>}
        </div>
        <Link
          href={seeAllHref}
          className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-primary hover:underline"
        >
          Lihat Semua
          <ArrowRight size={15} aria-hidden />
        </Link>
      </div>

      <div className="-mx-4 mb-5 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {chips.map((chip) => (
          <Chip key={chip.href} href={chip.href} active={chip.active}>
            {chip.label}
          </Chip>
        ))}
      </div>

      {properties.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border py-12 text-center text-sm text-muted-foreground">
          Belum ada listing aktif saat ini.
        </p>
      ) : (
        <Rail label={heading}>
          {properties.map((property) => (
            <PropertyCard
              key={property.id}
              property={property}
              variant="rail"
              initialFavorited={favoriteIds.has(property.id)}
            />
          ))}
        </Rail>
      )}
    </section>
  )
}
```

- [ ] **Step 7: Implementasi `components/home/rail-chips.ts`**

```ts
import { PROPERTY_TYPES, PROPERTY_TYPE_LABELS } from "@/lib/constants"
import { BUDGET_RANGES, budgetHref, type BudgetRange } from "@/lib/budget-ranges"
import type { RailChip } from "@/components/home/ListingRail"

/** "Pilihan Untukmu": every type, plus rentals. Each opens the catalog filtered. */
export const TYPE_CHIPS: readonly RailChip[] = [
  { label: "Semua", href: "/properti", active: true },
  ...PROPERTY_TYPES.map((t) => ({ label: PROPERTY_TYPE_LABELS[t], href: `/properti?type=${t}` })),
  { label: "Disewakan", href: "/properti?listingType=sewa" },
]

/** The budget chips, with the band the rail is showing marked. */
export function budgetChips(shown: BudgetRange): RailChip[] {
  return BUDGET_RANGES.map((range) => ({
    label: range.label,
    href: budgetHref(range),
    active: range.id === shown.id,
  }))
}
```

- [ ] **Step 8: Jalankan, pastikan lulus**

Run: `pnpm test components/home/ListingRail.test.tsx`
Expected: PASS, 6 tests.

- [ ] **Step 9: Commit**

```bash
git add components/home/Chip.tsx components/home/Rail.tsx components/home/ListingRail.tsx components/home/rail-chips.ts components/home/ListingRail.test.tsx lib/brand.ts
git commit -m "feat(home): rail listing dengan chip tipe dan budget

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 5: Grid keuntungan dan CTA kontak

**Files:**
- Create: `components/home/BenefitsGrid.tsx`, `components/home/ContactCta.tsx`
- Test: `components/home/BenefitsGrid.test.tsx`, `components/home/ContactCta.test.tsx`
- Modify: `lib/brand.ts` (tambah `benefits`, `contactCta`)

**Interfaces:**
- Consumes: `buildAgentWhatsAppLink` (`@/lib/whatsapp`).
- Produces:
  - `default function BenefitsGrid()`
  - `default function ContactCta(props: { whatsapp?: string })` — `<section id="contact">`; `whatsapp` default `BRAND.contact.whatsapp`.
  - `BRAND.benefits: { heading, subtitle, items: { icon, title, description }[] }`, `BRAND.contactCta: { heading, body, agentsCta, whatsappCta }`

- [ ] **Step 1: Tambah copy ke `lib/brand.ts`**

Sisipkan setelah blok `budgetRail`. Setiap keuntungan berdasar fitur yang memang ada di app (atau klaim yang sudah ada di brand):

```ts
  benefits: {
    heading: "Keuntungan bersama TRIHUNI",
    subtitle: "Semua yang kamu butuhkan untuk menemukan properti yang tepat.",
    items: [
      { icon: "FileCheck", title: "Listing terverifikasi", description: "Setiap listing melalui verifikasi dokumen dan legalitas." },
      { icon: "Users", title: "Agen terpercaya", description: "Terhubung langsung dengan agen yang menangani setiap listing." },
      { icon: "MessageCircle", title: "Tanya lewat WhatsApp", description: "Hubungi agen langsung, tanpa formulir panjang." },
      { icon: "Calculator", title: "Simulasi KPR", description: "Hitung cicilan bulanan di setiap listing yang dijual." },
      { icon: "Map", title: "Cari lewat peta", description: "Lihat sebaran listing dan pilih lokasi yang pas." },
      { icon: "SlidersHorizontal", title: "Filter lengkap", description: "Saring berdasarkan tipe, kota, harga, dan kamar tidur." },
      { icon: "Heart", title: "Simpan favorit", description: "Tandai listing incaran dan buka lagi kapan saja." },
      { icon: "KeyRound", title: "Jual dan sewa", description: "Rumah, apartemen, tanah, dan ruko — untuk dibeli atau disewa." },
    ],
  },

  contactCta: {
    heading: "Butuh bantuan cari properti?",
    body: "Agen kami mengenal area dan tipe properti yang kamu cari. Ceritakan kebutuhanmu, kami bantu carikan.",
    agentsCta: "Lihat Agen Kami",
    whatsappCta: "Chat WhatsApp",
  },
```

- [ ] **Step 2: Tulis test yang gagal**

`components/home/BenefitsGrid.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react"
import BenefitsGrid from "@/components/home/BenefitsGrid"
import { BRAND } from "@/lib/brand"

describe("BenefitsGrid", () => {
  it("renders every benefit with its title and description", () => {
    render(<BenefitsGrid />)
    expect(screen.getAllByRole("listitem")).toHaveLength(BRAND.benefits.items.length)
    for (const item of BRAND.benefits.items) {
      expect(screen.getByRole("heading", { name: item.title })).toBeInTheDocument()
      expect(screen.getByText(item.description)).toBeInTheDocument()
    }
  })
})
```

`components/home/ContactCta.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react"
import ContactCta from "@/components/home/ContactCta"

describe("ContactCta", () => {
  it("is the #contact section the navbar's Kontak link points at", () => {
    const { container } = render(<ContactCta whatsapp="" />)
    expect(container.querySelector("section")).toHaveAttribute("id", "contact")
  })

  it("always links to the agent index", () => {
    render(<ContactCta whatsapp="" />)
    expect(screen.getByRole("link", { name: "Lihat Agen Kami" })).toHaveAttribute("href", "/agen")
  })

  it("hides WhatsApp when the office has no number", () => {
    render(<ContactCta whatsapp="" />)
    expect(screen.queryByRole("link", { name: /whatsapp/i })).not.toBeInTheDocument()
  })

  it("offers WhatsApp in international form when there is a number", () => {
    render(<ContactCta whatsapp="081234567890" />)
    const link = screen.getByRole("link", { name: /whatsapp/i })
    expect(link).toHaveAttribute("href", expect.stringContaining("wa.me/6281234567890"))
    expect(link).toHaveAttribute("target", "_blank")
  })
})
```

- [ ] **Step 3: Jalankan, pastikan gagal**

Run: `pnpm test components/home/BenefitsGrid.test.tsx components/home/ContactCta.test.tsx`
Expected: FAIL — module tidak ditemukan.

- [ ] **Step 4: Implementasi `components/home/BenefitsGrid.tsx`**

```tsx
import {
  Calculator,
  FileCheck,
  Heart,
  KeyRound,
  Map as MapIcon,
  MessageCircle,
  SlidersHorizontal,
  Users,
  type LucideIcon,
} from "lucide-react"
import { BRAND } from "@/lib/brand"

type BenefitIcon = (typeof BRAND.benefits.items)[number]["icon"]

const ICONS: Record<BenefitIcon, LucideIcon> = {
  FileCheck,
  Users,
  MessageCircle,
  Calculator,
  Map: MapIcon,
  SlidersHorizontal,
  Heart,
  KeyRound,
}

export default function BenefitsGrid() {
  const { benefits } = BRAND
  return (
    <section className="bg-muted">
      <div className="container mx-auto px-4 py-12 sm:py-16">
        <h2 className="text-xl font-bold text-accent sm:text-2xl">{benefits.heading}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{benefits.subtitle}</p>
        <ul className="mt-8 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {benefits.items.map((item) => {
            const Icon = ICONS[item.icon]
            return (
              <li key={item.title} className="rounded-xl bg-background p-4 sm:p-5">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Icon size={20} aria-hidden />
                </span>
                <h3 className="mt-3 text-[15px] font-semibold text-foreground">{item.title}</h3>
                <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">{item.description}</p>
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}
```

- [ ] **Step 5: Implementasi `components/home/ContactCta.tsx`**

```tsx
import Link from "next/link"
import { MessageCircle } from "lucide-react"
import { BRAND } from "@/lib/brand"
import { buildAgentWhatsAppLink } from "@/lib/whatsapp"

/**
 * The homepage's closing band and the navbar's "Kontak" target. WhatsApp shows
 * only when the office number is filled in BRAND — an empty value hides it
 * rather than pointing buyers at a number nobody answers.
 */
export default function ContactCta({ whatsapp = BRAND.contact.whatsapp }: { whatsapp?: string }) {
  const { contactCta } = BRAND
  const whatsappHref = buildAgentWhatsAppLink({ agentName: BRAND.name, phone: whatsapp })

  return (
    <section id="contact" className="container mx-auto scroll-mt-20 px-4 py-12 sm:py-16">
      <div className="flex flex-col gap-6 rounded-2xl bg-accent px-6 py-10 text-accent-foreground sm:px-10 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-xl">
          <h2 className="text-2xl font-bold sm:text-3xl">{contactCta.heading}</h2>
          <p className="mt-2 text-[15px] leading-relaxed text-accent-foreground/80">{contactCta.body}</p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link
            href="/agen"
            className="inline-flex h-12 items-center justify-center rounded-full bg-primary px-7 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            {contactCta.agentsCta}
          </Link>
          {whatsappHref && (
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-accent-foreground/40 px-7 text-sm font-semibold transition-colors hover:bg-accent-foreground hover:text-accent"
            >
              <MessageCircle size={16} aria-hidden />
              {contactCta.whatsappCta}
            </a>
          )}
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 6: Jalankan, pastikan lulus**

Run: `pnpm test components/home/BenefitsGrid.test.tsx components/home/ContactCta.test.tsx`
Expected: PASS, 5 tests.

- [ ] **Step 7: Commit**

```bash
git add components/home/BenefitsGrid.tsx components/home/ContactCta.tsx components/home/BenefitsGrid.test.tsx components/home/ContactCta.test.tsx lib/brand.ts
git commit -m "feat(home): grid keuntungan dan band CTA kontak

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 6: Homepage baru dan pembongkaran mesin brosur

**Files:**
- Modify: `app/page.tsx` (tulis ulang), `components/PopularCities.tsx` (tulis ulang), `lib/brand.ts`, `app/layout.tsx`, `app/globals.css`, `components/Reveal.tsx`, `components/Reveal.test.tsx`, `package.json`
- Delete: komponen brosur + test, video hero (lihat Step 4)

**Interfaces:**
- Consumes: semua dari Task 1–5; `getPropertiesWithImagesBatch(query: Promise<PropertyRow[]>)`, `getFavoritePropertyIds(userId): Promise<Set<string>>`, `CATALOG_ORDER_BY`, `catalogConditions`, `parseCatalogFilters`.
- Produces: `Reveal` tanpa prop `effect` (hanya efek `rise`); `BRAND.popularCities.subtitle`.

- [ ] **Step 1: Tulis ulang `app/page.tsx`**

```tsx
import { db } from "@/db"
import { properties } from "@/db/schema"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import SearchHero from "@/components/home/SearchHero"
import ListingRail from "@/components/home/ListingRail"
import BenefitsGrid from "@/components/home/BenefitsGrid"
import ContactCta from "@/components/home/ContactCta"
import PopularCities from "@/components/PopularCities"
import { TYPE_CHIPS, budgetChips } from "@/components/home/rail-chips"
import { BUDGET_RANGES, budgetHref, budgetParams, type BudgetRange } from "@/lib/budget-ranges"
import {
  CATALOG_ORDER_BY,
  catalogConditions,
  parseCatalogFilters,
  type RawCatalogParams,
} from "@/lib/catalog-query"
import { getPropertiesWithImagesBatch, getFavoritePropertyIds } from "@/lib/db-helpers"
import { BRAND } from "@/lib/brand"
import type { PropertyWithImages } from "@/lib/types"

export const revalidate = 60

const RAIL_SIZE = 10

/** The newest visible listings for a catalog filter — the same rules the catalog applies. */
function newestMatching(raw: RawCatalogParams): Promise<PropertyWithImages[]> {
  return getPropertiesWithImagesBatch(
    db
      .select()
      .from(properties)
      .where(catalogConditions(parseCatalogFilters(raw)))
      .orderBy(...CATALOG_ORDER_BY.terbaru)
      .limit(RAIL_SIZE),
  )
}

/**
 * The cheapest budget band that has any sale listing, with its listings — or
 * null when nothing is for sale, so the section is left out rather than empty.
 * Usually one query; at most one per band.
 */
async function getBudgetShowcase(): Promise<{ range: BudgetRange; items: PropertyWithImages[] } | null> {
  for (const range of BUDGET_RANGES) {
    const items = await newestMatching(budgetParams(range))
    if (items.length > 0) return { range, items }
  }
  return null
}

export default async function HomePage() {
  const [latest, budget, session] = await Promise.all([
    newestMatching({}),
    getBudgetShowcase(),
    getServerSession(authOptions),
  ])
  const favoriteIds = session?.user?.id ? await getFavoritePropertyIds(session.user.id) : new Set<string>()

  return (
    <>
      <SearchHero />
      <ListingRail
        heading={BRAND.listingRail.heading}
        subheading={BRAND.listingRail.subheading}
        chips={TYPE_CHIPS}
        properties={latest}
        favoriteIds={favoriteIds}
        seeAllHref="/properti"
      />
      {budget && (
        <ListingRail
          heading={BRAND.budgetRail.heading}
          subheading={`Properti dijual ${budget.range.label}`}
          chips={budgetChips(budget.range)}
          properties={budget.items}
          favoriteIds={favoriteIds}
          seeAllHref={budgetHref(budget.range)}
          className="pt-0 sm:pt-0"
        />
      )}
      <PopularCities />
      <BenefitsGrid />
      <ContactCta />
    </>
  )
}
```

- [ ] **Step 2: Tulis ulang `components/PopularCities.tsx`**

```tsx
import Link from "next/link"
import Image from "next/image"
import { db } from "@/db"
import { properties } from "@/db/schema"
import { and, eq, isNull, count } from "drizzle-orm"
import { BRAND } from "@/lib/brand"

// City photos are 4:3 and the tiles 4:5, so with object-cover a photo is drawn
// at 5/4 x 4/3 ≈ 1.67x its tile's width: tiles are ~50vw below sm, ~33vw to lg,
// and at most ~240px in the six-column row.
const CITY_TILE_SIZES = "(max-width: 639px) 85vw, (max-width: 1023px) 56vw, 400px"

async function getCityCounts(): Promise<Record<string, number>> {
  const rows = await db
    .select({ city: properties.city, total: count() })
    .from(properties)
    .where(and(eq(properties.status, "active"), isNull(properties.deletedAt)))
    .groupBy(properties.city)
  return Object.fromEntries(rows.map((r) => [r.city.toLowerCase(), r.total]))
}

export default async function PopularCities() {
  const counts = await getCityCounts()
  const { popularCities } = BRAND

  return (
    <section className="container mx-auto px-4 py-10 sm:py-12">
      <h2 className="text-xl font-bold text-accent sm:text-2xl">{popularCities.heading}</h2>
      <p className="mt-1 text-sm text-muted-foreground">{popularCities.subtitle}</p>
      <ul className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-6">
        {popularCities.cities.map((city) => (
          <li key={city.name}>
            <Link
              href={`/properti?city=${encodeURIComponent(city.name)}`}
              prefetch={false}
              className="group relative block aspect-[4/5] overflow-hidden rounded-xl bg-muted"
            >
              <Image
                src={city.image}
                alt={city.name}
                fill
                sizes={CITY_TILE_SIZES}
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-3 sm:p-4">
                <p className="text-base font-bold text-white sm:text-lg">{city.name}</p>
                <p className="text-xs text-white/80">{counts[city.name.toLowerCase()] ?? 0} properti</p>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}
```

- [ ] **Step 3: Rapikan `lib/brand.ts`**

1. Hapus blok-blok berikut seluruhnya (beserta komentarnya): `heroImageAlt`, `hero`, `intro`, `manifesto`, `exploreTypes`, `howWeWork`, `about`, `contactSection`.
2. Di `popularCities`, ganti `heading: "Kota Populer",` menjadi:

```ts
    heading: "Properti per kota",
    subtitle: "Jelajahi listing aktif di kota-kota pilihan.",
```

3. Ganti komentar di atas `logo` menjadi:

```ts
  // BrandMark draws the real TRIHUNI logo as inline SVG. `wordmark` is the
  // plain-text form; `monogram` only feeds the favicon (app/icon.svg and the
  // PNGs rendered from it).
```

4. Di `footer.company`, hapus baris `{ label: "Tentang Kami", href: "/#about" },`.

- [ ] **Step 4: Hapus komponen, test, video, dan dependency yang tak terpakai**

```bash
git rm components/IntroLoader.tsx components/IntroLoader.test.tsx \
  components/HomeMotion.tsx \
  components/HeroSection.tsx components/HeroSection.test.tsx \
  components/AboutSection.tsx components/AboutSection.test.tsx \
  components/HowWeWork.tsx components/HowWeWork.test.tsx \
  components/ManifestoBand.tsx \
  components/HomeListingCard.tsx components/HomeListingCard.test.tsx \
  components/ExploreTypes.tsx \
  components/ContactSection.tsx components/ContactSection.test.tsx \
  public/hero.av1.mp4 public/hero.mp4 public/hero.webm
pnpm remove gsap @gsap/react lenis
```

Lalu pastikan tidak ada sisa referensi:

Run: `grep -rnE "IntroLoader|HomeMotion|HeroSection|AboutSection|HowWeWork|ManifestoBand|HomeListingCard|ExploreTypes|ContactSection|gsap|lenis|hero\.(av1\.)?(mp4|webm)" app components lib --include=*.ts --include=*.tsx`
Expected: tidak ada output.

- [ ] **Step 5: Rapikan `app/layout.tsx`**

1. Ganti import font menjadi `import { Plus_Jakarta_Sans } from "next/font/google"`.
2. Hapus deklarasi `cormorant` dan `pinyon` beserta komentarnya.
3. Hapus komentar `// suppressHydrationWarning: ...` (3 baris) dan ganti tag `<html>` menjadi:

```tsx
    <html lang="id" className={jakarta.variable}>
```

- [ ] **Step 6: Rapikan `app/globals.css`**

1. Di `@theme inline`, hapus baris `--font-serif: ...`, `--font-script: ...`, dan `--color-ivory: var(--ivory);`.
2. Di `:root`, hapus komentar + baris `--ivory: #F3EDE4;`.
3. Hapus semuanya mulai dari baris `/* Hero entrance animations */` sampai dan termasuk penutup `}` dari `@keyframes intro-failsafe { ... }` — yaitu keyframes/kelas `hero-*`, `[data-parallax]`, `hero-kenburns`, `hero-grain`, `hero-scroll-cue`, dan seluruh blok `── Intro curtain`. Blok `/* ── Reduced motion ── */` di bawahnya tetap.

Run: `grep -nE "hero-|intro-|parallax|ivory|cormorant|pinyon|font-serif|font-script" app/globals.css`
Expected: tidak ada output.

- [ ] **Step 7: Sederhanakan `components/Reveal.tsx` ke efek `rise` saja**

Ganti seluruh isi file:

```tsx
"use client"

import { useEffect, useRef, useState, type ReactNode } from "react"
import { cn } from "@/lib/utils"

interface RevealProps {
  children: ReactNode
  className?: string
  /** stagger delay in ms */
  delay?: number
}

// Transitions name translate and opacity only (Tailwind v4 moves with the
// `translate` property, not `transform`); `transition-all` measured as a real
// cost while scrolling. Short, and triggered just before the element enters
// the screen, so the page never scrolls ahead of its own content.
const BASE = "transition-[translate,opacity] duration-[350ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none"

export default function Reveal({ children, className, delay = 0 }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (typeof IntersectionObserver === "undefined") return
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          io.disconnect()
        }
      },
      { threshold: 0, rootMargin: "0px 0px 10% 0px" },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={cn(BASE, visible ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0", className)}
    >
      {children}
    </div>
  )
}
```

Di `components/Reveal.test.tsx`, hapus test `'observes an unclipped wrapper for unveil, ...'` (seluruh blok `it(...)`).

- [ ] **Step 8: Verifikasi**

Run: `pnpm lint && pnpm typecheck && pnpm test`
Expected: semua lulus. (Jika `Navbar.test.tsx` / `useOverHero.test.tsx` gagal karena markup lama homepage, catat dan lanjutkan — keduanya ditulis ulang di Task 8.)

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "feat(home): homepage marketplace; intro, Lenis/GSAP dan section brosur dihapus

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 7: Token visual, tombol pill, SectionHeading

**Files:**
- Modify: `app/globals.css` (`:root`), `components/ui/button.tsx`, `components/SectionHeading.tsx`

**Interfaces:**
- Produces: `--radius: 0.75rem`, `--background: #FFFFFF`; `Button` default `rounded-full`; `SectionHeading` default `align="left"`.

- [ ] **Step 1: Setel ulang token di `:root` (`app/globals.css`)**

Ganti baris-baris berikut (nilai lain tetap):

```css
  /* Palette — deep brown / warm brown / sand gold / terracotta on white.
     Roles differ from the swatch names: terracotta drives calls to action,
     chips and prices; deep brown carries headings and every dark surface;
     sand gold is highlight only. */
  --background: #FFFFFF;
  --secondary: #F5F2EE;
  --muted: #F5F2EE;
  --border: #E9E3DC;
  --input: #E9E3DC;
  /* Marketplace: soft, rounded corners on cards and panels; buttons and
     chips are full pills on top of this. */
  --radius: 0.75rem;
```

- [ ] **Step 2: Tombol pill di `components/ui/button.tsx`**

Di string dasar `cva(...)`, ganti `rounded-lg` (yang pertama, setelah `items-center justify-center`) menjadi `rounded-full`. Di varian ukuran `xs`, `sm`, `icon-xs`, `icon-sm`, ganti `rounded-[min(var(--radius-md),10px)]` / `rounded-[min(var(--radius-md),12px)]` menjadi `rounded-full`. Ukuran `default` dan `lg`: ganti `px-2.5` menjadi `px-4`.

Run: `grep -n "rounded-\[min" components/ui/button.tsx`
Expected: tidak ada output.

- [ ] **Step 3: `components/SectionHeading.tsx` rata kiri, tanpa garis gold**

Ganti seluruh isi file:

```tsx
import { cn } from "@/lib/utils"

interface SectionHeadingProps {
  eyebrow?: string
  title: string
  subtitle?: string
  align?: "left" | "center"
  className?: string
}

export default function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = "left",
  className,
}: SectionHeadingProps) {
  const centered = align === "center"
  return (
    <div className={cn("mb-6", centered ? "text-center" : "text-left", className)}>
      {eyebrow ? (
        <p className="mb-1 text-[13px] font-semibold text-primary">{eyebrow}</p>
      ) : null}
      <h2 className="text-2xl font-bold tracking-tight text-accent sm:text-3xl">{title}</h2>
      {subtitle ? (
        <p className={cn("mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground", centered && "mx-auto")}>
          {subtitle}
        </p>
      ) : null}
    </div>
  )
}
```

Di `components/SectionHeading.test.tsx`, ganti dua test terakhir (`'centers by default'` dan `'can align left'`) dengan:

```tsx
  it('aligns left by default, like the marketplace section headings', () => {
    const { container } = render(<SectionHeading title="A" />)
    expect(container.firstChild).toHaveClass('text-left')
  })

  it('can center', () => {
    const { container } = render(<SectionHeading title="A" align="center" />)
    expect(container.firstChild).toHaveClass('text-center')
  })
```

Run: `pnpm test components/SectionHeading.test.tsx` — Expected: PASS.

- [ ] **Step 4: Verifikasi**

Run: `pnpm lint && pnpm typecheck && pnpm test`
Expected: lulus (kecuali Navbar yang ditangani Task 8, bila sudah tercatat di Task 6).

- [ ] **Step 5: Commit**

```bash
git add app/globals.css components/ui/button.tsx components/SectionHeading.tsx components/SectionHeading.test.tsx
git commit -m "feat(theme): latar putih, radius 0.75rem, tombol pill, judul rata kiri

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 8: Navbar solid dan link baru

**Files:**
- Modify: `components/navbar/nav-links.ts`, `components/Navbar.tsx`, `components/navbar/DesktopNav.tsx`, `components/navbar/MobileNav.tsx`, `components/navbar/UserMenu.tsx`
- Delete: `components/navbar/useOverHero.ts`, `components/navbar/__tests__/useOverHero.test.tsx`
- Test: `components/navbar/__tests__/nav-links.test.ts`, `components/Navbar.test.tsx`

**Interfaces:**
- Consumes: `SearchHero` punya `id="home"` (Task 3), `ContactCta` punya `id="contact"` (Task 5).
- Produces: `NAV_LINKS` = Beranda `/`, Properti `/properti`, Agen `/agen`, Kontak `/#contact`; `HOME_SECTIONS = ["home", "contact"]`; `DesktopNav`, `MobileNav`, `UserMenu` tanpa prop `light`.

- [ ] **Step 1: Ubah test `nav-links` (gagal dulu)**

Di `components/navbar/__tests__/nav-links.test.ts`:

1. Ganti test `'classifies every link the navbar actually renders'` menjadi:

```ts
  it("classifies every link the navbar actually renders", () => {
    const routes = NAV_LINKS.filter((l) => !isHashLink(l.href)).map((l) => l.href)
    expect(routes).toEqual(["/", "/properti", "/agen"])
  })

  it("points Kontak at the homepage's #contact section", () => {
    expect(NAV_LINKS.find((l) => l.id === "contact")?.href).toBe("/#contact")
  })

  it("no longer links the removed brochure sections", () => {
    expect(NAV_LINKS.map((l) => l.id)).toEqual(["home", "listings", "agents", "contact"])
  })
```

2. Di `'falls back to Home on the homepage until a section is observed'`, ganti `"about"` menjadi `"contact"`.
3. Di `'follows the observed section once there is one'`, ganti isinya:

```ts
    expect(isNavLinkActive("contact", "/", "contact")).toBe(true)
    expect(isNavLinkActive("home", "/", "contact")).toBe(false)
```

4. Di `'marks no section link outside the homepage'`, ganti array menjadi `["home", "contact"]` dan argumen ketiga `"contact"`.

Run: `pnpm test components/navbar/__tests__/nav-links.test.ts`
Expected: FAIL — routes masih `["/properti", "/agen"]`.

- [ ] **Step 2: Ubah `components/navbar/nav-links.ts`**

```ts
export const NAV_LINKS: NavLink[] = [
  { href: "/", label: "Beranda", id: "home" },
  { href: "/properti", label: "Properti", id: "listings" },
  { href: "/agen", label: "Agen", id: "agents" },
  { href: "/#contact", label: "Kontak", id: "contact" },
]

/** Sections observed on the homepage: the search hero and the contact band. */
export const HOME_SECTIONS = ["home", "contact"]
```

Run: `pnpm test components/navbar/__tests__/nav-links.test.ts`
Expected: PASS.

- [ ] **Step 3: Tambah test Navbar solid (gagal dulu)**

Tambahkan ke `components/Navbar.test.tsx`:

```tsx
describe('Navbar surface', () => {
  it('is solid on the homepage too, with no transparent mode', () => {
    const { container } = renderAt('/')
    const header = container.querySelector('header')!
    expect(header.className).toContain('bg-background')
    expect(header.className).not.toContain('bg-transparent')
  })

  it('shows a pill sign-in link when signed out', () => {
    const { getAllByRole } = renderAt('/properti')
    const masuk = getAllByRole('link', { name: /masuk/i })[0]
    expect(masuk).toHaveAttribute('href', '/masuk')
    expect(masuk.className).toContain('rounded-full')
  })
})
```

Run: `pnpm test components/Navbar.test.tsx`
Expected: FAIL — `bg-transparent` masih muncul di `/` atau link tanpa `rounded-full`.

- [ ] **Step 4: `components/Navbar.tsx` tanpa `useOverHero`**

```tsx
"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import BrandMark from "@/components/BrandMark"
import DesktopNav from "@/components/navbar/DesktopNav"
import MobileNav from "@/components/navbar/MobileNav"
import UserMenu from "@/components/navbar/UserMenu"
import { useActiveSection } from "@/components/navbar/useActiveSection"
import { isNavLinkActive } from "@/components/navbar/nav-links"
import { BRAND } from "@/lib/brand"

export default function Navbar() {
  const pathname = usePathname()
  const activeSection = useActiveSection()

  if (pathname.startsWith("/admin")) return null

  const isActive = (id: string) => isNavLinkActive(id, pathname, activeSection)

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background">
      <nav className="container mx-auto flex h-16 items-center justify-between gap-6 px-4">
        <Link href="/" className="shrink-0" aria-label={BRAND.name}>
          <BrandMark size="md" />
        </Link>

        <DesktopNav isActive={isActive} />

        <div className="flex shrink-0 items-center gap-2">
          <UserMenu />
          <MobileNav isActive={isActive} />
        </div>
      </nav>
    </header>
  )
}
```

```bash
git rm components/navbar/useOverHero.ts components/navbar/__tests__/useOverHero.test.tsx
```

- [ ] **Step 5: `components/navbar/DesktopNav.tsx`**

```tsx
"use client"

import NavLink from "@/components/navbar/NavLink"
import { NAV_LINKS } from "@/components/navbar/nav-links"
import { cn } from "@/lib/utils"

export default function DesktopNav({ isActive }: { isActive: (id: string) => boolean }) {
  return (
    <nav aria-label="Primary" className="mr-auto hidden items-center gap-1 lg:flex">
      {NAV_LINKS.map(({ href, label, id }) => (
        <NavLink
          key={id}
          href={href}
          id={id}
          className={cn(
            // font-bold on the active item is what Navbar.test reads.
            "whitespace-nowrap rounded-full px-4 py-2 text-sm transition-colors",
            isActive(id)
              ? "bg-primary/10 font-bold text-primary"
              : "font-medium text-foreground/70 hover:bg-muted hover:text-foreground",
          )}
        >
          {label}
        </NavLink>
      ))}
    </nav>
  )
}
```

- [ ] **Step 6: `components/navbar/MobileNav.tsx`**

1. Hapus prop `light` dari signature (jadi `{ isActive }: { isActive: (id: string) => boolean }`).
2. Ganti `className` tombol trigger menjadi:
   `"lg:hidden flex h-9 w-9 items-center justify-center rounded-full text-accent transition-colors hover:bg-muted outline-none focus-visible:ring-2 focus-visible:ring-ring"` (hapus `cn(...)` di sana).
3. Ganti `className` `NavLink` di daftar menjadi:

```tsx
                className={cn(
                  "flex items-center justify-between rounded-xl px-3 py-3 text-base transition-colors",
                  active ? "bg-primary/10 font-bold text-primary" : "font-medium text-foreground/75 hover:bg-muted",
                )}
```

   dan isi link-nya menjadi `{label}` saja (hapus `<span className={active ? "italic" ...}>` dan garis gold).
4. Ganti `className` link "Masuk" di bawah menjadi:
   `"flex h-12 w-full items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"`.
5. Header sheet: ganti `<span className="text-[11px] font-semibold uppercase tracking-[0.3em] text-foreground">{BRAND.name}</span>` menjadi `<BrandMark size="sm" />` dan tambahkan `import BrandMark from "@/components/BrandMark"`; hapus import `BRAND` bila tak terpakai lagi.

- [ ] **Step 7: `components/navbar/UserMenu.tsx`**

1. Signature menjadi `export default function UserMenu()`.
2. Link "Masuk" (signed out):

```tsx
      <Link
        href="/masuk"
        className="hidden h-10 items-center rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 sm:flex"
      >
        Masuk / Daftar
      </Link>
```

3. Link "Dashboard": ganti className menjadi `"hidden h-10 items-center gap-2 rounded-full bg-primary px-4 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 sm:flex"`.
4. Trigger dropdown: ganti `cn(... light ? ...)` menjadi string `"flex items-center gap-1.5 rounded-full px-2 py-1.5 transition-colors outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring"`, dan `ChevronDown` className menjadi `"hidden text-foreground/40 sm:block"`.
5. Hapus import `cn` bila tak terpakai.

- [ ] **Step 8: Jalankan semua test navbar**

Run: `pnpm test components/Navbar.test.tsx components/navbar`
Expected: PASS.

- [ ] **Step 9: Verifikasi dan commit**

Run: `pnpm lint && pnpm typecheck && pnpm test`
Expected: semua lulus.

```bash
git add -A components/Navbar.tsx components/Navbar.test.tsx components/navbar
git commit -m "feat(navbar): bar putih solid, link pill, menu Beranda/Properti/Agen/Kontak

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 9: Footer ringkas

**Files:**
- Modify: `components/Footer.tsx`

**Interfaces:**
- Consumes: `BRAND.footer.{tagline, closing, explore, company}`, `BRAND.contact`, `BRAND.social`, `BrandMark inverted`.

- [ ] **Step 1: Ubah bagian atas footer**

1. Ganti tag pembuka `<footer id="kontak" data-footer className="bg-accent text-accent-foreground">` menjadi `<footer className="bg-accent text-accent-foreground">`.
2. Hapus `<div aria-hidden className="h-px" style={{...}} />` (garis gradasi gold).
3. Ganti `<div data-footer-content className="mx-auto max-w-[1440px] px-[clamp(1.25rem,5vw,4.5rem)] pt-[clamp(4rem,8vw,6rem)] pb-10">` menjadi `<div className="container mx-auto px-4 pt-12 pb-8">`.
4. Ganti blok penutup (div yang berisi `<p data-split ...>` dan link `closing.cta`) seluruhnya dengan:

```tsx
        <div className="mb-10 flex flex-col gap-4 border-b border-accent-foreground/15 pb-10 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xl font-bold sm:text-2xl">
            {BRAND.footer.closing.lead} {BRAND.footer.closing.trail}
          </p>
          <Link
            href="/properti"
            className="inline-flex h-11 items-center gap-2 self-start rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 sm:self-auto"
          >
            {BRAND.footer.closing.cta}
            <ArrowRight size={15} aria-hidden />
          </Link>
        </div>
```

- [ ] **Step 2: Rapikan tipografi kolom**

1. Ketiga `<h3 className="mb-5 text-[10px] font-semibold uppercase tracking-[0.28em] text-gold">` → `<h3 className="mb-4 text-sm font-semibold text-accent-foreground">`.
2. Ikon sosial: `className="flex h-9 w-9 items-center justify-center border ..."` → tambahkan `rounded-full` setelah `flex`.
3. Baris tagline paling bawah: `className="text-[10px] uppercase tracking-[0.2em] text-accent-foreground/50"` → `className="text-xs text-accent-foreground/50"`.

Run: `grep -nE "data-(split|footer)|font-serif|tracking-\[0\.2" components/Footer.tsx`
Expected: tidak ada output.

- [ ] **Step 3: Verifikasi dan commit**

Run: `pnpm lint && pnpm typecheck`
Expected: lulus.

```bash
git add components/Footer.tsx
git commit -m "feat(footer): footer ringkas, CTA pill, tanpa serif dan clip-path

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 10: Katalog dengan bar filter horizontal, grid listing

**Files:**
- Modify: `components/PropertyFilter.tsx`, `app/properti/page.tsx`, `components/CatalogViewToggle.tsx`, `app/agen/[id]/page.tsx`, `app/profil/page.tsx`
- Test: `components/__tests__/PropertyFilter.test.tsx`

**Interfaces:**
- Consumes: `rupiahToJuta`, `jutaToRupiah` (tetap diekspor), kunci URL yang sama (`q`, `sort`, `type`, `listingType`, `city`, `minPrice`, `maxPrice`, `minBedrooms`).
- Produces: `default function PropertyFilter(props: { layout?: "stack" | "bar" })`.

- [ ] **Step 1: Tambah test chip filter (gagal dulu)**

Ganti mock `next/navigation` di `components/__tests__/PropertyFilter.test.tsx` supaya bisa diatur per test, lalu tambah test:

```tsx
import { render, screen, fireEvent } from "@testing-library/react"
import PropertyFilter, { rupiahToJuta, jutaToRupiah } from "@/components/PropertyFilter"

const push = jest.fn()
let mockParams = new URLSearchParams()

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
  useSearchParams: () => mockParams,
}))

beforeEach(() => {
  push.mockClear()
  mockParams = new URLSearchParams()
})
```

(test `price fields in millions` yang sudah ada tetap di bawahnya), lalu:

```tsx
describe("bar layout", () => {
  it("shows property types as chips and marks the current one", () => {
    mockParams = new URLSearchParams("type=ruko")
    render(<PropertyFilter layout="bar" />)
    expect(screen.getByRole("button", { name: "Ruko" })).toHaveAttribute("aria-pressed", "true")
    expect(screen.getByRole("button", { name: "Rumah" })).toHaveAttribute("aria-pressed", "false")
  })

  it("filters by type with the same URL key as before, back on page one", () => {
    mockParams = new URLSearchParams("page=3&city=Bandung")
    render(<PropertyFilter layout="bar" />)
    fireEvent.click(screen.getByRole("button", { name: "Apartemen" }))
    expect(push).toHaveBeenCalledWith("/properti?city=Bandung&type=apartemen")
  })

  it("clears the type when its active chip is pressed again", () => {
    mockParams = new URLSearchParams("type=tanah")
    render(<PropertyFilter layout="bar" />)
    fireEvent.click(screen.getByRole("button", { name: "Tanah" }))
    expect(push).toHaveBeenCalledWith("/properti?")
  })

  it("switches jual/sewa with chips", () => {
    render(<PropertyFilter layout="bar" />)
    fireEvent.click(screen.getByRole("button", { name: "Disewa" }))
    expect(push).toHaveBeenCalledWith("/properti?listingType=sewa")
  })
})
```

Run: `pnpm test components/__tests__/PropertyFilter.test.tsx`
Expected: FAIL — tidak ada tombol "Ruko".

- [ ] **Step 2: Tambah layout `bar` di `components/PropertyFilter.tsx`**

1. Ubah signature: `export default function PropertyFilter({ layout = "stack" }: { layout?: "stack" | "bar" }) {`, dan tambahkan `const bar = layout === "bar"` di awal body.
2. Tambahkan import `import { cn } from "@/lib/utils"`.
3. Tambahkan komponen kecil di atas `export default`:

```tsx
function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        "inline-flex h-9 shrink-0 items-center rounded-full border px-4 text-[13px] font-medium transition-colors",
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-background text-foreground/75 hover:border-primary hover:text-primary",
      )}
    >
      {children}
    </button>
  )
}
```

4. Di dalam komponen, setelah `const maxPrice = ...`, tambahkan:

```tsx
  const type = searchParams.get("type") ?? ""
  const listingType = searchParams.get("listingType") ?? ""

  if (bar) {
    return (
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          {PROPERTY_TYPES.map((t) => (
            <FilterChip key={t} active={type === t} onClick={() => updateFilter("type", type === t ? "" : t)}>
              {PROPERTY_TYPE_LABELS[t]}
            </FilterChip>
          ))}
          <span aria-hidden className="mx-1 h-6 w-px bg-border" />
          {Object.entries(LISTING_TYPE_LABELS).map(([k, v]) => (
            <FilterChip
              key={k}
              active={listingType === k}
              onClick={() => updateFilter("listingType", listingType === k ? "" : k)}
            >
              {v}
            </FilterChip>
          ))}
          {hasFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters} className="ml-auto">
              <X className="mr-1 h-3 w-3" />
              Reset
            </Button>
          )}
        </div>
        <div className="grid grid-cols-2 gap-2 md:grid-cols-3 xl:grid-cols-6">{fields}</div>
      </div>
    )
  }
```

5. Supaya field teks/select dipakai dua layout tanpa duplikasi, pindahkan elemen-elemen field ke variabel `fields` sebelum blok `if (bar)`:
   - `fields` = fragment berisi, berurutan: form pencarian `q`, select `city`, input `minPrice`, input `maxPrice`, select `minBedrooms`, select `sort` — persis JSX yang sudah ada sekarang (label kecil + kontrol), dengan dua perubahan: ganti setiap `rounded-xl` pada `Input`/`SelectTrigger` menjadi `rounded-full`, dan ganti setiap kelas label `text-[11px] font-medium uppercase tracking-[0.16em] text-foreground/70 mb-1 block` menjadi `mb-1 block text-xs font-medium text-muted-foreground`.
   - Select `type` dan `listingType` **tidak** masuk `fields`; di layout `stack` keduanya tetap dirender seperti sekarang (setelah `q`), jadi return `stack` menjadi: header (judul Filter + Reset), lalu `<div className="space-y-3">` berisi `q`-form, select type, select listingType, lalu sisa field. Cara termudah: definisikan `const searchField = (...)`, `const typeField = (...)`, `const listingField = (...)`, `const cityField`, `const minPriceField`, `const maxPriceField`, `const bedroomsField`, `const sortField` sebagai konstanta JSX, lalu
     - `const fields = <>{searchField}{cityField}{minPriceField}{maxPriceField}{bedroomsField}{sortField}</>`
     - return `stack`: `{searchField}{sortField}{typeField}{listingField}{cityField}{minPriceField}{maxPriceField}{bedroomsField}` — urutan yang sama dengan sekarang.

- [ ] **Step 3: Jalankan test filter**

Run: `pnpm test components/__tests__/PropertyFilter.test.tsx`
Expected: PASS (3 test lama + 4 test baru).

- [ ] **Step 4: Tata ulang `app/properti/page.tsx`**

1. Ganti seluruh `return (...)` di `PropertiPage` dengan:

```tsx
  return (
    <div className="container mx-auto px-4 py-8">
      <SectionHeading title={BRAND.pageTitle.catalogHeading} />

      {/* Desktop: the filter bar stays under the navbar while the grid scrolls. */}
      <div className="sticky top-16 z-30 -mx-4 mb-6 hidden border-b border-border bg-background px-4 py-3 lg:block">
        <Suspense>
          <PropertyFilter layout="bar" />
        </Suspense>
      </div>

      <div className="mb-5 flex items-center justify-between gap-3">
        <div className="lg:hidden">
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
        </div>
        <div className="ml-auto">
          <CatalogViewToggle view={filters.view} filters={raw} />
        </div>
      </div>

      {filters.view === "peta" ? (
        <Suspense fallback={<MapSkeleton />}>
          <PropertyMapPanel filters={filters} />
        </Suspense>
      ) : (
        <Suspense fallback={<PropertyGridSkeleton />}>
          <PropertyGrid filters={filters} raw={raw} />
        </Suspense>
      )}
    </div>
  )
```

   Sesuaikan bagian akhir lama (penutup `<Suspense>` grid yang sudah ada) — sebelum mengedit, baca sisa file dari baris `{filters.view === "peta" ? (` sampai akhir dan pastikan prop `PropertyGrid` sama (`filters={filters} raw={raw}`). Tambahkan `import { BRAND } from "@/lib/brand"`.

2. Di `PropertyGridSkeleton` dan grid `PropertyGrid`, ganti kelas grid menjadi `"grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"`; di skeleton ganti `SKELETON_CARDS` ke 8 item dan `Skeleton className="h-48 w-full rounded-lg"` → `"aspect-[4/3] w-full rounded-xl"`.
3. Di `PropertyGrid`, delay `Reveal` menjadi `(i % 4) * 90`, dan ganti paragraf hitungan menjadi:

```tsx
      <p className="mb-5 text-sm text-muted-foreground">
        <span className="font-semibold text-foreground">{total} properti</span> ditemukan
        <span className="text-muted-foreground/70"> · menampilkan {start}–{end}</span>
      </p>
```

4. Ganti setiap `rounded-sm` di file ini (panel peta, empty state peta, skeleton peta) menjadi `rounded-xl`, dan setiap `className="mt-5 rounded-xl"` / `className="rounded-sm"` pada `Button` hapus (Button sudah pill).

- [ ] **Step 5: `components/CatalogViewToggle.tsx` pill**

Ganti `className="inline-flex overflow-hidden rounded-sm border border-border"` menjadi `className="inline-flex gap-1 rounded-full border border-border p-1"`, dan pada tiap link tambahkan `rounded-full` ke kelas dasar (`"flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[13px] font-medium transition-colors"`).

Jalankan `pnpm test components/__tests__/CatalogViewToggle.test.tsx` — Expected: PASS (test memeriksa href/aria-current, bukan kelas).

- [ ] **Step 6: Grid agen dan profil**

1. `app/agen/[id]/page.tsx`: ganti grid listing ke `"grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"`, dan `rounded-sm` → `rounded-xl`.
2. `app/profil/page.tsx`: grid favorit → `"grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"`, delay `(i % 4) * 90`.
3. `app/agen/page.tsx`: `rounded-sm` → `rounded-xl`.

- [ ] **Step 7: Verifikasi dan commit**

Run: `pnpm lint && pnpm typecheck && pnpm test`
Expected: semua lulus.

```bash
git add components/PropertyFilter.tsx components/__tests__/PropertyFilter.test.tsx app/properti/page.tsx components/CatalogViewToggle.tsx app/agen app/profil/page.tsx
git commit -m "feat(katalog): bar filter horizontal dengan chip, grid 4 kolom

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 11: Perbarui `AGENTS.md`

**Files:**
- Modify: `AGENTS.md` (bagian `### Design tokens` sampai sebelum `### Brand config`, dan baris route `/`)

- [ ] **Step 1: Ganti seluruh bagian `### Design tokens`**

Hapus semua teks dari baris `### Design tokens` sampai tepat sebelum `### Brand config (\`lib/brand.ts\`)`, ganti dengan:

```markdown
### Design tokens
Every colour lives in `app/globals.css`. The palette is deep brown `#4A2E1C`,
warm brown `#8A5526`, sand gold `#D6A76A` and terracotta `#C06A14` on white,
with near-black `#1B1B1B` text, mapped to roles rather than to those names:
`--primary` is terracotta and drives calls to action, active chips and
prices; `--accent` is deep brown and carries headings and every dark surface
(footer, admin sidebar, the homepage contact band); `--gold` is highlight
only. `--muted` is the warm grey behind alternating sections. `--radius` is
`0.75rem`; cards are `rounded-xl`, and buttons and chips are full pills
(`components/ui/button.tsx` defaults to `rounded-full`).

Typography is Plus Jakarta Sans throughout (`font-sans`, `font-heading`,
`font-display` all resolve to it), wired up in `app/layout.tsx` at weights
400–700 — nothing lighter, nothing heavier, so don't reach for `font-light` or
`font-extrabold`. There is no serif or script face.

The look is a property marketplace (modelled on the browsing style of Indonesian
rental marketplaces — style only, no borrowed assets or copy). The homepage is
built from `components/home/`: `SearchHero` (a rounded banner photograph with
a GET search form, `id="home"`), two `ListingRail`s — "Pilihan Untukmu" with
type chips, and "Cari sesuai budgetmu" showing the cheapest band from
`lib/budget-ranges.ts` that has a sale listing (left out when nothing is for
sale) — then `PopularCities`, `BenefitsGrid`, and `ContactCta`
(`id="contact"`, the navbar's Kontak target). Chips are links into
`/properti`, so the rails need no client-side fetching. Budget bands stop one
rupiah short of the next band because `catalogConditions` applies price
bounds inclusively.

`PropertyCard` is the one listing card everywhere — homepage rails
(`variant="rail"`, fixed 260px), catalog, agent and profile grids. Title,
location, a one-line spec (`specLine`), then the price.

The navbar is always solid white with a bottom border; there is no
transparent-over-hero mode. Scrolling is native everywhere — there is no
Lenis, GSAP, or intro curtain. `Reveal` is a single short `rise`, used on
catalog, agent and profile grids, not on the homepage.

Performance findings that still hold: the hero is the only eager photograph,
`loading="eager"` + `fetchPriority="high"` (Next 16 deprecates `priority`;
React 19 writes the `<link rel="preload">` for it); never give another
photograph `fetchPriority="high"`, since React preloads every server-rendered
`<img>` that is neither lazy nor low priority. `sizes` everywhere is the width
the photograph is *drawn* at, not the frame's: a 4:3 city photo in a 4:5 tile
is drawn ~1.67x the tile's width (`CITY_TILE_SIZES` in `PopularCities`).
Transitions name `translate` and `opacity` rather than `transition-all`, and
there is no `backdrop-blur` — both measured as dropped frames over moving
photographs on integrated GPUs.
```

- [ ] **Step 2: Baris route homepage**

Di tabel Routes, ganti `| \`/\` | Homepage — featured active listings |` menjadi:

```markdown
| `/` | Homepage — search hero, listing rails by type and budget, cities, benefits, contact band |
```

- [ ] **Step 3: Pastikan tidak ada referensi usang**

Run: `grep -nE "IntroLoader|HomeMotion|Lenis|GSAP|useOverHero|HomeListingCard|Cormorant|Pinyon|ivory|drift|unveil|data-parallax|-mt-16" AGENTS.md`
Expected: tidak ada output.

- [ ] **Step 4: Commit**

```bash
git add AGENTS.md
git commit -m "docs(agents): token, homepage marketplace, dan navbar solid

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 12: Verifikasi akhir dan screenshot

- [ ] **Step 1: Rantai verifikasi penuh**

Run: `pnpm lint && pnpm typecheck && pnpm test && pnpm build`
Expected: semua lulus; `pnpm build` tanpa error. Catat jumlah test.

- [ ] **Step 2: Jalankan dev server**

Run (background): `pnpm dev`
Tunggu sampai `Ready` di http://localhost:3001.

- [ ] **Step 3: Screenshot dengan Playwright** (pakai skill `playwright-cli`)

Ambil empat screenshot full-page ke scratchpad:
- `/` pada 1440×900 dan 375×812
- `/properti` pada 1440×900 dan 375×812

Periksa secara visual:
- Tidak ada scroll horizontal halaman di 375px (rail boleh scroll di dalam dirinya).
- Hero: headline, form, chip Semua/Dijual/Disewa terbaca; navbar putih solid.
- Rail: kartu 260px, chip di atasnya, panah hanya di desktop.
- Katalog desktop: bar filter di atas grid 4 kolom; mobile: tombol pill "Filter".

- [ ] **Step 4: Cek alur pencarian di browser**

Di `/`, ketik "Jakarta" di hero, pilih "Rumah", klik "Cari Sekarang".
Expected: URL `/properti?q=Jakarta&type=rumah`, chip "Rumah" di bar filter aktif.

Klik menu "Kontak" dari `/properti`.
Expected: mendarat di `/#contact`, band CTA terlihat di bawah navbar.

- [ ] **Step 5: Hentikan dev server dan laporkan**

Kirim screenshot ke user. Jika ada temuan visual, perbaiki dalam commit `fix(...)` terpisah dan ulangi Step 1.
