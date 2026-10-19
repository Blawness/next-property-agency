# Lebih mirip Rukita: hero, panel bertab, kartu flat — design

Tanggal: 2026-10-19
Status: disetujui di chat (pendekatan A), menunggu review spec

## Tujuan

Pengguna menilai UI "kurang mirip Rukita". Perbandingan langsung dengan
rukita.co (desktop 1440px dan mobile 375px) menunjukkan perbedaan ada di
struktur, bukan warna. Tiga bagian ditiru lebih dekat:

1. Hero full-bleed + navbar transparan di atasnya.
2. Panel listing bertab yang berganti di tempat.
3. Kartu listing flat.

### Batasan

- Font tetap **Plus Jakarta Sans**; warna tetap palet TRIHUNI (terakota,
  cokelat). Tidak ada aset/copy Rukita.
- Tidak menyalin: flash sale, promo, brand block, penghargaan, liputan,
  search bar di navbar saat scroll, pilihan tanggal.
- Tanpa perubahan skema DB. Listing hanya lewat
  `getPropertiesWithImagesBatch`; filter lewat `catalogConditions`.
- Homepage dirender per request (session), jadi jumlah query homepage
  harus tetap kecil.

### Kriteria sukses

- Screenshot homepage 1440px dan 375px berdampingan dengan Rukita terbaca
  sebagai pola yang sama: hero full-bleed melengkung dengan navbar
  transparan dan search pill satu baris; panel bertab dengan kategori
  berikon; kartu flat.
- Ganti tab/kategori tanpa navigasi dan tanpa loading.
- `lint → typecheck → test → build` hijau.

## 1. Hero dan navbar

**`components/home/SearchHero.tsx`** (ditulis ulang, tetap `id="home"`):

- Full-bleed (tanpa `container`), tinggi ±600px desktop / ±520px mobile,
  ditarik ke bawah navbar dengan `-mt-16`.
- Sudut kiri bawah melengkung besar (`rounded-bl-[4rem]` desktop,
  `rounded-bl-[2.5rem]` mobile). Foto `object-cover`, gradasi gelap dari
  bawah-kiri.
- Judul (`BRAND.searchHero.headline`) dan subjudul putih di kiri bawah,
  di dalam `container`.
- **Search pill desktop (sm ke atas):** satu baris putih `rounded-full`
  shadow — Lokasi (Input, ikon pin) | Tipe (Select) | Dijual/Disewa
  (Select) | tombol terakota "Cari" (ikon search). Pemisah vertikal tipis
  antar field. Menempel di bawah hero (setengah di dalam foto).
- **Search pill mobile:** satu baris — input "Cari properti…" + tombol
  bulat terakota. Tanpa tipe/jual-sewa (ada di katalog).
- Logika `searchHref` tetap; Select memakai sentinel `semua` + input
  tersembunyi seperti sekarang. Tanpa JS, input `q` tetap terkirim.
- Satu-satunya foto eager + `fetchPriority="high"`; `sizes` dihitung dari
  lebar yang digambar (full-bleed: `100vw`, mobile diperiksa ulang karena
  rasio tinggi).

**Navbar transparan (`components/Navbar.tsx` + hook baru
`components/navbar/useOverHero.ts`):**

- Hanya di `/`: selama `#home` masih di bawah bar, header `bg-transparent`
  tanpa border, logo `inverted`, trigger dropdown, "Masuk / Daftar" dan
  ikon menu putih. Setelah lewat: putih solid seperti sekarang.
- Hook: `IntersectionObserver` pada `#home` dengan `rootMargin` atas
  `-64px`; pathname berubah → mulai ulang (pelajaran `useActiveSection`);
  menunggu `#home` yang di-stream (rAF, maks ±2 detik).
- Di luar `/` selalu solid. Dropdown yang terbuka tetap panel putih.

## 2. Panel listing bertab

**`components/home/ListingPanel.tsx`** (client) menggantikan rail
"Pilihan Untukmu":

- Panel `container`, `rounded-3xl`, latar `bg-muted`, menimpa ±40px bagian
  bawah hero (`-mt-10 relative z-10`).
- Atas: shadcn **`Tabs`** dua segmen — Dijual | Disewa (lebar penuh,
  tab aktif putih, tidak aktif abu).
- Bawah tab: baris kategori berikon lucide — Semua, Rumah (`Home`),
  Apartemen (`Building2`), Tanah (`Map` atau `Trees`), Ruko (`Store`) —
  ikon di atas label, garis bawah terakota pada yang aktif; scroll
  horizontal di mobile. Pakai `ToggleGroup type="single"` (role radio).
- Isi: `Rail` (Carousel) berisi `PropertyCard variant="rail"`; kosong →
  pesan "Belum ada listing untuk pilihan ini." + tombol ke katalog.
- Bawah: tombol "Lihat Semua" → `/properti?listingType=<tab>[&type=<kat>]`.
- State awal: Dijual / Semua, dirender di server (komponen client menerima
  data sebagai props).

**Data (pendekatan A), `app/page.tsx`:**

- Dua query paralel: listing aktif terbaru per `listingType`, masing-masing
  `limit 48`, lewat `getPropertiesWithImagesBatch` +
  `catalogConditions(parseCatalogFilters({ listingType }))`.
- **`lib/listing-groups.ts`** (pure): `groupByType(items, perGroup = 10)`
  → `{ semua, rumah, apartemen, tanah, ruko }`, urutan terjaga, masing-
  masing maksimal `perGroup`.
- Panel hanya menerima data yang sudah dikelompokkan (≤ 2×5×10 kartu, bisa
  tumpang tindih antara "semua" dan per-tipe; tidak masalah karena kartu
  yang sama).
- Rail budget tetap (query sendiri), lalu PopularCities, BenefitsGrid,
  ContactCta — tidak berubah selain kartu flat.

## 3. Kartu flat

**`components/PropertyCard.tsx`** (semua pemakai):

- Tanpa border, tanpa shadow, tanpa latar kartu; hover: foto sedikit
  menggelap/zoom ringan, judul terakota.
- Foto `aspect-[4/3] rounded-xl overflow-hidden`; badge di kiri atas
  (seperti sekarang); favorit putih bulat di kanan atas (seperti sekarang).
- Teks di bawah foto (`pt-2.5`):
  1. Label tipe kecil berikon: `[ikon] Rumah · Dijual` (`text-xs
     text-muted-foreground`).
  2. Judul tebal `line-clamp-2`.
  3. Lokasi abu (`address ?? city`), 1 baris.
  4. Spek dengan ikon kecil (`BedDouble`, `Bath`, `Maximize2`) — `specLine`
     tetap untuk teks, ikon di depan baris.
  5. Harga **hitam tebal** (`text-foreground`), "Rp" kecil, suffix
     **"/bulan"** untuk sewa.
- Tombol WhatsApp tetap (kecil bulat), di baris harga.
- Varian `rail` lebar 260px tetap.

**Token:** `--primary` tidak lagi mewarnai harga; AGENTS.md diperbarui.

## Testing

- `lib/listing-groups.ts`: pengelompokan, urutan, batas per grup, tipe
  kosong → array kosong.
- `ListingPanel`: tab awal Dijual/Semua; klik Disewa dan kategori
  mengganti kartu; kondisi kosong; href "Lihat Semua" per kombinasi;
  tablist/role radio berlabel.
- `useOverHero` + Navbar: transparan di `/` saat hero di bawah bar, solid
  di halaman lain dan setelah lewat; restart saat pathname berubah.
- `SearchHero`: search pill mobile vs desktop, `searchHref` tetap,
  input tersembunyi.
- `PropertyCard`: urutan label tipe → judul → lokasi → spek → harga,
  "/bulan" untuk sewa, harga bukan terakota.
- Verifikasi: lint → typecheck → test → build; screenshot 1440 dan 375
  berdampingan dengan Rukita.

## Risiko

- Tipe yang jarang (mis. Ruko sewa) bisa kosong di panel walau ada di DB
  di luar 48 terbaru — pesan kosong + tombol ke katalog menutup celah ini.
- Navbar transparan pernah ada dan dihapus; bug lama (bar putih di atas
  putih) dicegah dengan test dan hero `-mt-16`.
