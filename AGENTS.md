# AGENTS.md — next-property-catalog

## Commands

```bash
pnpm dev          # dev server (http://localhost:3000)
pnpm build        # production build
pnpm lint         # ESLint
pnpm test         # Jest (jsdom env, setup via jest.setup.js)
pnpm test:watch   # Jest watch mode
pnpm seed         # seed database via db/seed.ts (requires DATABASE_URL)
```

Order for verification: `lint -> typecheck (tsc --noEmit) -> test -> build`.

## Architecture

**PropIndo** — Indonesian property listing platform (rumah, apartemen, tanah, ruko).

### Stack
- **Next.js 16.2.4** (App Router) + **React 19**
- **Drizzle ORM** + **Neon** (serverless PostgreSQL) — client at `db/index.ts`, schema at `db/schema.ts`
- **NextAuth v4** (Credentials provider with bcrypt) — config at `lib/auth.ts`, handler at `app/api/auth/[...nextauth]/route.ts`
- **UploadThing** — image uploads via `lib/uploadthing.ts` + `app/api/uploadthing/route.ts`
- **Tailwind CSS v4** + **shadcn/ui** (radix-nova style) — components in `components/ui/`
- **Leaflet / react-leaflet** — map views (`components/PropertyMap.tsx`, `components/LeafletMapView.tsx`)
- **sonner** — toast notifications (Toaster in root layout)
- **next-themes** — dark/light mode (ThemeProvider in `components/Providers.tsx`, toggle in `components/ThemeToggle.tsx`)

### Brand Config (`lib/brand.ts`)
All brand-related strings (name, tagline, descriptions, page titles, stats, headlines) are centralized in `lib/brand.ts`. Import `BRAND` or `brandTitle()` from `@/lib/brand`. When rebranding, only this file needs changes.

### Database (`db/schema.ts`)
4 tables: `profiles`, `properties`, `property_images`, `favorites`.

Enums: `role` (buyer|agent|admin), `property_type` (rumah|apartemen|tanah|ruko), `listing_type` (jual|sewa), `status` (active|sold|rented).

Migrations: `pnpm exec drizzle-kit generate` then `pnpm exec drizzle-kit migrate`. Config at `drizzle.config.ts` reads `.env.local`.

### Routes
| Path | Purpose |
|------|---------|
| `/` | Homepage — featured active listings |
| `/properti` | Catalog with filters |
| `/properti/[id]` | Property detail with lightbox gallery |
| `/peta` | Map view of all listings |
| `/masuk` | Sign in |
| `/daftar` | Sign up (buyer only — agents created by admin) |
| `/profil` | User profile + favorites |
| `/admin` | Admin dashboard — stats |
| `/admin/properti` | Admin — property list table with thumbnails |
| `/admin/properti/create` | Admin — create property form |
| `/admin/properti/[id]/edit` | Admin — edit property form with ImageManager |
| `/admin/agent` | Admin — agent management (CRUD) |
| `POST /api/properties` | Create property (admin only) |
| `GET /api/properties` | List properties with filters & pagination (admin) |
| `PATCH /api/properties/[id]` | Update property (admin) |
| `DELETE /api/properties/[id]` | Delete property (admin) |
| `GET /api/admin/stats` | Dashboard statistics (admin) |
| `GET\|POST /api/admin/agents` | List & create agents (admin) |
| `PATCH\|DELETE /api/admin/agents/[id]` | Update & delete agents (admin) |
| `GET\|POST /api/favorites` | Favorites CRUD |
| `/api/auth/[...nextauth]` | NextAuth handler |
| `/api/auth/register` | Registration (buyer only) |
| `/api/uploadthing` | UploadThing handler |

### Path Alias
`@/` maps to project root (see `tsconfig.json`).

## Key Conventions & Gotchas

- **Rate limiter is in-memory** (`lib/rate-limit.ts`) — resets on process restart, not shared across instances. Used for login protection (5 attempts / 15 min).
- **`PropertyWithImages`** (`lib/types.ts`) is the primary data shape — use `getPropertiesWithImagesBatch()` (`lib/db-helpers.ts`) to avoid N+1 queries.
- **Decimal fields** (`price`, `lat`, `lng`) are stored as strings in TypeScript types — convert with `parseFloat()` or `Number()` before math.
- **shadcn/ui** uses `radix-nova` style with CSS variables (see `components.json`). Add components via `pnpm dlx shadcn add <component>`.
- **`.env.local` is gitignored** — never commit secrets. Required vars: `DATABASE_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, `UPLOADTHING_TOKEN`.
- **Image domains** allowed: `images.unsplash.com`, `utfs.io`, `*.ufsedge.com`, `*.uploadthing.com` (see `next.config.ts`).
- **Brand strings** — All text like "PropIndo", "Temukan Properti Impianmu", page titles, etc. are in `lib/brand.ts`. Never hardcode brand strings.
- **Admin role** — To make a user admin, run direct SQL: `UPDATE profiles SET role = 'admin' WHERE email = '...'`. Role is propagated via JWT/session. Admin routes guarded in `app/admin/layout.tsx`.
- **Dark mode** — Uses `next-themes` with `class` strategy. CSS variables in `globals.css` cover both themes. Toggle in Navbar and admin sidebar.
