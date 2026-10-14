# Redesign gaya marketplace ala Rukita — design

Tanggal: 2026-10-14
Status: disetujui per bagian di chat, menunggu review spec

## Tujuan

Mengubah TRIHUNI dari homepage bergaya brosur residensial (serif, band
gelap, scroll sinematik Lenis/GSAP, intro curtain) menjadi situs
**marketplace properti** yang padat, cerah, dan mudah dijelajahi, dengan
gaya visual dan struktur homepage terinspirasi Rukita.

### Yang diminta

- Rombak total: tampilan visual *dan* struktur homepage, katalog, kartu.
- Palet TRIHUNI dipertahankan (cocok dengan logo asli), tapi dipakai ala
  Rukita: putih dominan, aksen hanya di CTA/chip/harga.
- Homepage hanya berisi section "inti marketplace" yang bisa diisi dari
  data yang sudah ada.

### Batasan

- Yang ditiru adalah **gaya**, bukan aset: tidak ada logo, foto, ikon,
  atau copy Rukita. TRIHUNI tetap tampil sebagai brand sendiri.
- Tidak ada perubahan skema database — DB masih dipakai bersama
  `next-property-catalog`.
- Tidak ada section promo/harga coret, penghargaan, liputan media, atau
  download app (tidak ada datanya; mengisinya dengan karangan berarti
  klaim palsu).
- Semua brand string tetap lewat `lib/brand.ts`.
- Listing untuk grid/rail tetap lewat `getPropertiesWithImagesBatch`;
  filter tetap lewat `lib/catalog-query.ts`.

### Kriteria sukses

- `/` terbaca sebagai marketplace: pencarian di atas, deretan listing,
  chip filter, tile kota, grid keuntungan.
- Satu `PropertyCard` dipakai di homepage, katalog, agen, profil.
- Tidak ada intro curtain; homepage scroll native, tanpa gsap/lenis di
  bundle.
- `lint → typecheck → test → build` hijau; screenshot `/` dan
  `/properti` di desktop dan 375px diperiksa.

## 1. Sistem visual

File: `app/globals.css`, `app/layout.tsx`.

- **Warna.** `--background` putih (`#FFFFFF`); `--muted` abu sangat
  terang untuk latar section selang-seling. `--primary` (terakota
  `#C06A14`) hanya untuk CTA, chip aktif, harga. `--accent` (cokelat tua
  `#4A2E1C`) untuk footer, sidebar admin, dan warna judul. `--gold`
  hanya badge. `--ivory` dihapus.
- **Bentuk.** `--radius` dari `0.25rem` menjadi `0.75rem`. Kartu
  `rounded-xl` dengan shadow tipis yang naik saat hover. Tombol dan chip
  `rounded-full`.
- **Tipografi.** Plus Jakarta Sans saja (400–700). Cormorant Garamond
  (`--font-serif`) dan Pinyon Script (`--font-script`) dihapus dari
  `layout.tsx` dan `globals.css`. Judul section: kiri, semibold, 20–28px,
  dengan link "Lihat Semua" di kanan. Eyebrow bernomor `01`–`05`
  dihapus.
- **Navbar.** Selalu putih solid dengan `border-b`. Mode transparan di
  atas hero dan `useOverHero` dihapus; tidak ada lagi `-mt-16` di hero.
  Tombol "Masuk / Daftar" berbentuk pill.
- **Navigasi.** `NAV_LINKS` menjadi: Beranda (`/`), Properti
  (`/properti`), Agen (`/agen`), Kontak (`/#kontak`, band CTA di bawah
  homepage). Tentang dan Proses dihapus karena section-nya hilang.
  `HOME_SECTIONS` dan `useActiveSection` disesuaikan.
- **Footer.** Tetap `bg-accent`, kolom link + kontak yang lebih ringkas.
  `data-footer-clip` dan wrapper `bg-accent` di homepage dihapus.

## 2. Homepage (`app/page.tsx`)

Server component, `revalidate = 60` dipertahankan. Dari atas ke bawah:

1. **Hero pencarian** (`components/home/SearchHero.tsx`). Foto banner
   membulat di dalam container (bukan full-bleed), satu-satunya foto
   `loading="eager"` + `fetchPriority="high"`. Headline dan tagline dari
   `BRAND.hero`. Form pencarian: input kata kunci/lokasi (`q`), select
   tipe (`type`), toggle Jual/Sewa (`listingType`), tombol "Cari
   Sekarang". Form GET biasa ke `/properti`, sehingga bekerja tanpa
   JavaScript; field kosong tidak ikut di URL (komponen client kecil
   untuk membuang parameter kosong sebelum submit).
2. **Pilihan Untukmu** (`components/home/ListingRail.tsx`). Baris chip
   link: Semua, Rumah, Apartemen, Tanah, Ruko, Disewakan — masing-masing
   ke `/properti?...` yang sesuai. Di bawahnya rail horizontal berisi
   ±10 listing aktif terbaru, `overflow-x-auto` + `snap-x`, tombol
   panah prev/next di desktop. Tombol "Lihat Semua" ke `/properti`.
3. **Cari sesuai budgetmu** (`components/home/BudgetRail.tsx`). Chip
   rentang harga jual: `< 500 jt`, `500 jt – 1 M`, `1 – 3 M`, `> 3 M`.
   Chip adalah link ke `/properti?listingType=jual&minPrice=&maxPrice=`.
   Rentang didefinisikan sekali di `lib/budget-ranges.ts` (pure, diuji).
   Rail di bawahnya menampilkan listing jual pada rentang pertama yang
   punya hasil; query memakai `catalogConditions(parseCatalogFilters(...))`
   agar aturan filter tetap satu sumber. Jika tidak ada listing jual sama
   sekali, section ini tidak dirender.
4. **Properti per kota.** `PopularCities` dipakai ulang dengan tampilan
   baru: tile foto `rounded-xl`, nama kota, jumlah listing. `TILE_SIZES`
   dipertahankan.
5. **Keuntungan bersama TRIHUNI** (`components/home/BenefitsGrid.tsx`).
   Grid 4×2 (2 kolom di mobile): ikon lucide, judul, satu kalimat. Copy
   di `BRAND.benefits`.
6. **CTA kontak** (`components/home/ContactCta.tsx`, `id="kontak"`).
   Band `bg-muted`: "Butuh bantuan cari properti?", tombol ke `/agen`,
   dan tombol WhatsApp hanya jika `BRAND.contact.whatsapp` terisi (lewat
   `buildAgentWhatsAppLink`/helper yang ada, bukan `wa.me` manual).

Data: `Promise.all` atas listing terbaru, listing budget, favorit user.
Semua lewat `getPropertiesWithImagesBatch`. Tidak ada query per kartu.

Rail dan grid tidak memakai `Reveal`; homepage tampil langsung.

## 3. PropertyCard dan katalog

### `components/PropertyCard.tsx`

- Foto rasio 4:3, `rounded-xl`, tanpa border. Pill putih kecil
  Jual/Sewa + tipe di kiri atas, `FavoriteButton` bulat putih di kanan
  atas.
- Dihapus: gradasi gelap bawah foto, hairline gold, zoom 105%. Hover =
  shadow menebal.
- Isi di bawah foto, berurutan: judul (`line-clamp-2`), lokasi abu-abu
  (`address ?? city`, 1 baris), spek satu baris `3 KT · 2 KM · 120 m²`
  (tanah: luas tanah saja), lalu baris harga — harga tebal terakota
  (`formatPriceCompactValue`, sewa dengan suffix) dan ikon WhatsApp bulat
  di kanan bila `buildWhatsAppLink` menghasilkan href.
- Prop `variant?: "grid" | "rail"`; `rail` = lebar tetap ±260px untuk
  carousel. `sizes` disesuaikan per varian dengan lebar gambar yang
  digambar.
- `HomeListingCard.tsx` dan test-nya dihapus; homepage memakai
  `PropertyCard variant="rail"`.

### Katalog `/properti`

- Bar filter horizontal sticky di atas hasil (desktop): chip tipe, chip
  Jual/Sewa, dropdown harga, dropdown KT, sort, toggle Grid/Peta.
  Menggantikan sidebar. Mobile: tombol pill "Filter" membuka `Sheet`.
- `PropertyFilter` tetap menulis ke URL dengan kunci yang sama; yang
  berubah hanya layout dan gaya. `parseCatalogFilters` tidak berubah.
- Grid: 1 / 2 (sm) / 3 (lg) / 4 (xl) kolom. "X properti ditemukan" di
  kiri atas grid.
- Pagination, peta, `MapCoverageNotice` tetap; tombol jadi pill.

### Halaman lain

`/properti/[id]`, `/agen`, `/agen/[id]`, auth, admin: tidak dirombak
strukturnya; ikut berubah lewat token dan `components/ui/button`.
`SectionHeading` diberi gaya baru (kiri, tanpa eyebrow bernomor).
Rombakan detail listing ala Rukita = proyek terpisah.

## 4. Penghapusan, dokumentasi, testing

### Dihapus

- Komponen + test: `IntroLoader`, `HomeMotion`, `HeroSection`,
  `AboutSection`, `HowWeWork`, `ManifestoBand`, `HomeListingCard`,
  `ExploreTypes`, `ContactSection`, `components/navbar/useOverHero.ts`
  (+ test).
- Dependency: `gsap`, `@gsap/react`, `lenis`.
- `app/layout.tsx`: font Cormorant + Pinyon, inline script `intro-*`,
  `suppressHydrationWarning` di `<html>`.
- `app/globals.css`: CSS `intro-*`, `--ivory`, `--font-serif`,
  `--font-script`, efek `Reveal` `drift`/`unveil` bila tak terpakai lagi.
- `lib/brand.ts`: `intro`, `manifesto`, `about`, dan copy how-we-work.
  Ditambah: `hero` (diperbarui), `benefits`, label budget bila perlu.

### Tetap

`Reveal` (efek `rise`), `SectionHeading`, `PopularCities`.

### `AGENTS.md`

- "Design tokens": radius, tipografi tunggal, peran warna baru.
- Paragraf homepage brosur / Lenis / GSAP / IntroLoader / `useOverHero`
  diganti deskripsi singkat homepage marketplace.
- Dipertahankan: hanya hero yang eager + `fetchPriority="high"`;
  `sizes` = lebar gambar yang digambar; hindari `backdrop-blur`.
- Navbar: tidak ada mode transparan.

### Testing

Baru:
- `PropertyCard`: urutan judul → lokasi → spek → harga; spek tanah;
  suffix sewa; WhatsApp tersembunyi tanpa nomor; varian rail.
- `SearchHero`: submit membentuk `/properti?...` tanpa parameter kosong.
- `lib/budget-ranges.ts`: tiap rentang menghasilkan `minPrice`/`maxPrice`
  yang diterima `parseCatalogFilters`.
- `nav-links`: link baru dan `isNavLinkActive`.

Diperbarui: `Navbar.test.tsx` (tanpa mode transparan), test katalog
filter bila markup berubah.

Verifikasi: `pnpm lint → pnpm typecheck → pnpm test → pnpm build`, lalu
`pnpm dev` + screenshot Playwright `/` dan `/properti` di 1440px dan
375px.

### Risiko

- Intro dan scroll sinematik hanya bisa dipulihkan lewat git.
- Link lama ke `/#about` / `/#how` jadi mendarat di atas homepage
  (tidak error).
- Tidak ada perubahan skema DB.
