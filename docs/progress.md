# Progress Report: next-property-catalog (PropIndo / Tiga Anak Propertindo)

> **Brand:** Tiga Anak Propertindo — Properti Premium Indonesia  
> **Repo:** `next-property-catalog`  
> **Author:** blawness (60 commits)  
> **Periode:** 28 April 2026 — 5 Mei 2026 (~8 hari)  
> **Files Changed:** 113 files, ~21.302 lines added, ~6.690 lines removed

---

## Ringkasan Eksekutif

Platform listing properti Indonesia (rumah, apartemen, tanah, ruko) berbasis **Next.js 16.2.4 (App Router) + React 19**, menggunakan **Drizzle ORM + Neon (serverless PostgreSQL)**, **NextAuth v4** (Credentials + bcrypt), **UploadThing** untuk upload gambar, dan **Tailwind CSS v4 + shadcn/ui** untuk UI. Telah mencapai fungsionalitas **MVP lengkap** dengan sistem publik (katalog, detail properti, peta interaktif, filter) dan **admin CMS** penuh (dashboard, CRUD properti, manajemen agent, upload gambar) serta dukungan **dark mode**, **rate limiting**, dan **caching**.

---

## Fase Perkembangan

### Fase 0: Inisialisasi (28 Apr 2026)
**Commit:** `8b89900` — Initial commit from Create Next App

Proyek dimulai dari `create-next-app` vanilla. Stack awal masih kosong tanpa database, auth, atau komponen kustom apa pun.

### Fase 1: Foundation Setup (28-30 Apr 2026)
**Commits:** 7 commits

- **NextAuth v4** diimplementasikan menggantikan Better Auth yang sempat dicoba (`fa5e013`)
- Migrasi dari npm ke pnpm (`e53c4fb`)
- Setup Drizzle ORM dengan Neon PostgreSQL
- Schema database: `profiles`, `properties`, `property_images`, `favorites`
- Enums: `role` (buyer|agent|admin), `property_type` (rumah|apartemen|tanah|ruko), `listing_type` (jual|sewa), `status` (active|sold|rented)
- Seed script untuk data dummy (3 agents + 15 properti + 15 gambar)
- Path alias `@/` dikonfigurasi

### Fase 2: Core Features & Refinement (29 Apr - 3 Mei 2026)
**Commits:** 17 commits

- Constants & formatting functions terpusat (`lib/constants.ts`)
- Batch image fetching helper (`getPropertiesWithImagesBatch()`) untuk menghilangkan N+1
- Registration endpoint dengan validasi + rate limiting
- Favorites API (toggle, batch retrieval)
- Property detail page dengan metadata generation untuk SEO
- Map view dengan Leaflet/react-leaflet
- Catalog page dengan filter (type, city, price, bedrooms)
- Search functionality
- Komponen: PropertyCard, PropertyFilter, PropertyGalleryClient, PropertySpecs, HeroSection, Navbar, Footer
- Design spec untuk decomposing 4 large files (`4cb3564`)

### Fase 3: Admin CMS (3 Mei 2026)
**Commits:** 11 commits

- **Admin dashboard** dengan stat cards (total properti, aktif, agent, bulan ini) — `db51b5e`
- Admin layout dengan sidebar navigasi (fixed, responsive mobile)
- Admin property list table dengan thumbnails, search, filter, pagination
- Create property form dengan custom hook `usePropertyForm()`
- Edit property form dengan **ImageManager** (upload, reorder, delete)
- **Property form fields** — form grid 2 kolom dengan conditional fields (tanah: no bedrooms/bathrooms)
- Guard routing: admin-only pages + API route protection
- Toast notifications (sonner)
- Lightbox gallery pada property detail
- Micro-interactions, mobile admin, empty states
- UI components: button, card, dialog, dropdown-menu, input, label, select, sheet, skeleton, badge, avatar, separator

### Fase 4: Image Upload System (3-4 Mei 2026)
**Commits:** 10 commits

- UploadThing integration dengan 2 endpoints: `propertyImages` & `profileImage`
- Allowed image domains dikonfigurasi di `next.config.ts` (utfs.io, ufsedge.com, uploadthing.com)
- ImageManager untuk edit property photos (delete overlay, primary badge, upload loading state)
- ImageUploadSection untuk create form
- Property thumbnail columns di admin table
- Migrasi dari `file.url` deprecated ke `file.ufsUrl`
- Upload loading states (Loader2 placeholders)

### Fase 5: Avatar System (4 Mei 2026)
**Commits:** 12 commits

- `avatar_url` column ditambahkan ke tabel `profiles` (migration 0002)
- UploadThing route untuk profile image
- Avatar URL di-propagate ke JWT session image
- `PATCH /api/profil` endpoint untuk update avatar
- Avatar CRUD di admin agent management
- Avatar upload di profile page (user-facing)
- Navbar avatar dengan `next/image`
- JWT update trigger untuk avatar persistence

### Fase 6: Homepage & Branding (3-4 Mei 2026)
**Commits:** 10 commits

- Centralisasi semua brand strings ke `lib/brand.ts` — satu file untuk rebranding
- Hero section dengan parallax background, animated headline, search form, stats
- ExploreTypes — 2x2 grid tipe properti dengan emoji
- PopularCities — 6 kota dengan Unsplash images
- TrustSection — 3 kolom "Mengapa Kami"
- Footer dengan brand info dan navigation links
- City images diperbaiki dengan iconic landmarks
- Dark mode dengan `next-themes`

### Fase 7: Polish & Performance (4-5 Mei 2026)
**Commits:** 14 commits

- **Caching:** `revalidate` directives pada public pages (homepage: 60s, catalog: 60s, detail: 30s, map: 120s)
- **Performance:** Replace N+1 agent counts dengan groupBy query
- **Validation:** Numeric field validation di property API
- **A11Y:** Keyboard navigation dan ARIA attributes untuk lightbox
- **Rate limiting:** Diterapkan ke semua mutation endpoints (property CRUD, agent CRUD, profile, favorites, register) — 30 requests/60s window
- Login rate limiting: 5 attempts / 15 minutes
- **Filter state:** Admin property filter state sync dengan URL
- **Error states:** Error handling untuk admin pages dan hooks (retry button, skeleton loading)
- **Mobile improvements:** Filter drawer (Sheet) untuk mobile users
- **Footer:** ConditionalFooter — disembunyikan di admin routes
- **10 codebase improvement proposals** didokumentasikan

---

## Arsitektur Saat Ini

### Stack Teknologi

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16.2.4 (App Router) + React 19 |
| Database | Neon (serverless PostgreSQL) + Drizzle ORM 0.45.2 |
| Auth | NextAuth v4 (Credentials + bcrypt, JWT strategy) |
| File Upload | UploadThing 7.7.4 |
| Styling | Tailwind CSS v4 + tw-animate-css |
| UI Library | shadcn/ui (radix-nova style, CSS variables) |
| Icons | lucide-react |
| Map | Leaflet 1.9.4 + react-leaflet 5.0.0 |
| Toasts | sonner 2.0.7 |
| Dark Mode | next-themes 0.4.6 |
| Validation | zod 4.4.2 |
| Testing | Jest 30.3.0 + @testing-library/react 16.3.2 |
| Package Manager | pnpm |

### Database Schema (4 tables)

- **profiles** — id, email, password_hash, full_name, phone, avatar_url, role (buyer|agent|admin), created_at
- **properties** — id, title, description, price, type, listing_type, city, address, lat, lng, land_area, building_area, bedrooms, bathrooms, agent_id (FK), status, created_at
- **property_images** — id, property_id (FK, cascade), url, is_primary, order
- **favorites** — id, user_id (FK, cascade), property_id (FK, cascade), unique index on (user_id, property_id)

### Routes (14 public + 11 admin)

**Public:**
| Route | Deskripsi |
|-------|-----------|
| `/` | Homepage — hero, featured listings, explore types, popular cities, trust section |
| `/properti` | Catalog with filters (type, city, price, bedrooms) |
| `/properti/[id]` | Property detail with lightbox gallery, specs, map, agent card |
| `/peta` | Full-screen map view |
| `/masuk` | Sign in (rate-limited) |
| `/daftar` | Sign up (buyer only) |
| `/profil` | Profile + favorites (auth required) |

**Admin:**
| Route | Deskripsi |
|-------|-----------|
| `/admin` | Dashboard — 4 stat cards |
| `/admin/properti` | Property list with search, filter, pagination |
| `/admin/properti/create` | Create property form |
| `/admin/properti/[id]/edit` | Edit property form with ImageManager |
| `/admin/agent` | Agent management (CRUD) |

### API Endpoints (14 endpoints)

| Method | Route | Purpose |
|--------|-------|---------|
| POST | `/api/auth/register` | Register buyer |
| POST | `/api/auth/[...nextauth]` | NextAuth handler |
| GET/POST | `/api/properties` | List (admin) / Create |
| GET/PATCH/DELETE | `/api/properties/[id]` | Read / Update / Delete |
| GET | `/api/admin/stats` | Dashboard stats |
| GET/POST | `/api/admin/agents` | List / Create agents |
| PATCH/DELETE | `/api/admin/agents/[id]` | Update / Delete agent |
| GET/POST | `/api/favorites` | List / Toggle favorites |
| PATCH | `/api/profil` | Update profile avatar |
| GET/POST | `/api/uploadthing` | UploadThing handler |

### Komponen (26 files)

- **22 application components:** Navbar, Footer, ConditionalFooter, ThemeToggle, Providers, HeroSection, HeroSearchForm, HeroPropertyTypePills, HeroStats, ExploreTypes, PopularCities, TrustSection, PropertyCard, PropertyFilter, PropertyGalleryClient, PropertySpecs, PropertyMap, LeafletMap, MapView, LeafletMapView, AgentCard, ImageManager, ImageUploadSection, PropertyFormFields
- **2 hooks:** useFavorites, usePropertyForm
- **1 test file:** PropertyCard.test.tsx (2 tests)
- **11 shadcn/ui components:** avatar, badge, button, card, dialog, dropdown-menu, input, label, select, sheet, skeleton, separator

### Library Files (8 files)

- `brand.ts` — Semua brand strings terpusat
- `auth.ts` — NextAuth configuration
- `types.ts` — Core TypeScript types
- `constants.ts` — Constants + formatting functions
- `db-helpers.ts` — Batch image fetching helper
- `rate-limit.ts` — In-memory rate limiter
- `uploadthing.ts` — UploadThing file router
- `utils.ts` — cn() utility

---

## Fitur yang Telah Diimplementasikan

### Frontend
- [x] Responsive navbar dengan auth-aware UI
- [x] Hero section dengan parallax, animated headline, search form
- [x] Property type pills (rumah/apartemen/tanah/ruko)
- [x] Stats display (15.000+ properti, 34 provinsi, 500+ agen)
- [x] Explore types grid (2x2)
- [x] Popular cities grid (2x3) dengan Unsplash images
- [x] Trust section (3 kolom)
- [x] Footer dengan navigation links
- [x] Property catalog dengan filter sidebar (desktop) + drawer (mobile)
- [x] Filter by: type, listing type, city, price range, bedrooms
- [x] Property detail page dengan lightbox gallery
- [x] Property specs grid (bedrooms, bathrooms, building area, land area)
- [x] Property map (Leaflet, single marker)
- [x] Full-screen map view (multi-marker)
- [x] Agent card dengan WhatsApp link
- [x] Price formatting (compact: Rp 1.0 M / Rp 500 Jt / full)
- [x] Badges untuk listing type, property type, status
- [x] Dark mode (next-themes, class strategy)
- [x] Toast notifications (sonner)
- [x] Shimmer skeleton loading states
- [x] Empty states ("Tidak ada properti yang sesuai filter")
- [x] Error states dengan retry button
- [x] 404 handling untuk properti tidak ditemukan
- [x] Keyboard navigation + ARIA untuk lightbox
- [x] Mobile-responsive admin sidebar (hamburger menu)

### CMS (Admin)
- [x] Admin dashboard dengan 4 stat cards (total, aktif, agent, bulan ini)
- [x] Property management (CRUD) dengan search, filter, pagination
- [x] Property form dengan conditional fields (tanah: hide bedrooms/bathrooms)
- [x] Image upload saat create (UploadThing)
- [x] ImageManager untuk edit (upload, primary badge, delete)
- [x] Agent management (CRUD) dengan avatar upload + temp password
- [x] Admin route guard (session + role check)
- [x] API route protection (session + role)

### Auth & Security
- [x] NextAuth v4 dengan Credentials provider + bcrypt
- [x] JWT session dengan role propagation
- [x] Registration dengan validasi (name, email, password min 8)
- [x] Rate limiting: login (5/15min), mutation endpoints (30/60s)
- [x] Timing attack prevention (dummy hash comparison)
- [x] Admin-only property creation & management
- [x] Zod validation di semua API endpoints

### Performance
- [x] `revalidate` caching pada public pages (30-120s)
- [x] Batch image fetching (N+1 prevention)
- [x] GroupBy query untuk agent counts (optimasi N+1)
- [x] Dynamic import untuk Leaflet (SSR disabled)
- [x] Suspense boundaries dengan skeleton fallback

### Data
- [x] Seed script (3 agents, 15 properties, 15 images)
- [x] 10 cities with coordinates
- [x] Unsplash images untuk setiap properti
- [x] Favorites toggle (authenticated users)
- [x] 3 migrations (initial schema + admin role + avatar_url)

### Testing
- [x] Jest setup with jsdom + @testing-library
- [x] PropertyCard tests (title rendering, price formatting)

---

## Celah / Belum Tersentuh

### Fitur yang Belum Ada
- [ ] **Image reordering** — drag-and-drop untuk urutan gambar
- [ ] **Image deletion** — UploadThing server-side delete
- [ ] **Edit property location** — map picker untuk lat/lng
- [ ] **Property search** — text search di catalog publik (sudah di admin)
- [ ] **Sorting** — sort by price, date, etc. di catalog
- [ ] **Pagination** — catalog publik masih terbatas 48 items
- [ ] **Agent registration** — hanya admin yang bisa buat agent
- [ ] **Agent dashboard** — agent belum punya dedicated page
- [ ] **Profile editing** — hanya avatar yang bisa diubah, belum name/phone
- [ ] **Password change** — belum ada "ganti password"
- [ ] **Forgot password / reset** — belum ada
- [ ] **Email verification** — belum ada
- [ ] **Social login** — hanya credentials provider
- [ ] **Admin dapat assign agent di property form** — saat ini admin selalu jadi agentId
- [ ] **Property image count badge** — belum nampilin jumlah foto
- [ ] **Share property** — social share buttons
- [ ] **Contact agent via form** — masih manual WhatsApp link
- [ ] **Sitemap / SEO** — belum ada sitemap.xml atau robots.txt custom
- [ ] **i18n** — masih Indonesia-only
- [ ] **PWA / offline support** — belum
- [ ] **E2E tests** — belum ada
- [ ] **Component storybook / visual tests** — belum
- [ ] **CI/CD** — belum dikonfigurasi
- [ ] **Deployment** — belum di-deploy

### Technical Debt
- [ ] **Admin role hardcoded** — tidak ada UI untuk promote user ke admin (via SQL manual)
- [ ] **In-memory rate limiter** — reset on restart, tidak shared across instances
- [ ] **Jumlah commit per hari tinggi (8-10)** — menunjukkan iterative development cepat, tapi ada risiko technical debt
- [ ] **Tidak ada OpenAPI/Swagger docs** — API tidak didokumentasikan
- [ ] **Tidak ada monitoring/logging** — error tracking belum diintegrasikan
- [ ] **Env vars** — butuh dokumentasi setup yang lebih jelas untuk developer baru
- [ ] **README out of date** — masih template create-next-app default

---

## Evolusi Kode per Fase (Statistik)

| Fase | Commits | Files Changed | Fokus |
|------|---------|---------------|-------|
| Inisialisasi | 1 | ~30 | Template Next.js |
| Foundation | 7 | ~40 | Auth, DB, schema, seed |
| Core Features | 17 | ~60 | Catalog, detail, map, filter, search |
| Admin CMS | 11 | ~45 | Dashboard, CRUD, layout |
| Image Upload | 10 | ~20 | UploadThing, ImageManager |
| Avatar System | 12 | ~25 | Avatar CRUD, JWT propagation |
| Homepage & Branding | 10 | ~15 | Hero, brand.ts, dark mode |
| Polish & Performance | 14 | ~30 | Caching, rate limit, a11y, error states |

**Total: 60 commits, ~8 hari pengerjaan**

---

## Kesimpulan

Proyek telah berkembang pesat dari template Next.js kosong menjadi **platform listing properti fungsional** dengan:
- Frontend publik yang responsif dengan katalog, filter, peta interaktif
- Admin CMS lengkap (CRUD properti, manajemen agent, upload gambar)
- Sistem autentikasi dengan role-based access control
- Rate limiting dan validasi untuk keamanan
- Caching untuk performa publik
- Branding terpusat untuk kemudahan rebranding

Kondisi saat ini adalah **MVP yang solid** — semua fitur inti untuk platform listing properti sudah berfungsi. Celah utama ada di area **polish lanjutan** (sorting, pagination publik, edit profile, forgot password), **deployment readiness** (CI/CD, env docs, error monitoring), dan **testing coverage** (hanya 1 file test).
