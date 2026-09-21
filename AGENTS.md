# AGENTS.md — next-property-agency

Guidance for coding agents (Claude Code, Codex, opencode) working in this repo.

## Commands

```bash
pnpm dev        # dev server on http://localhost:3001
pnpm build      # production build
pnpm lint       # ESLint
pnpm typecheck  # tsc --noEmit
pnpm test       # Jest (jsdom, setup via jest.setup.js)
pnpm seed       # seed the database via db/seed.ts
```

Verify in this order: `lint → typecheck → test → build`.

## Origin

Forked from [`next-property-catalog`](https://github.com/Blawness/next-property-catalog).
The core — schema, migrations, API routes, auth, admin, map, leads, favorites —
came across unchanged; the brand, palette, typography and two features are this
repo's own. **It currently shares that project's `DATABASE_URL`**, so a schema
change here lands on both sites. Point `.env.local` at a separate Neon project
before either app needs a column the other does not have.

Dev runs on **port 3001** so both apps can be up at once.

## Environment Variables

Required in `.env.local`:
- `DATABASE_URL` — Neon PostgreSQL connection string (pooled)
- `DATABASE_URL_DIRECT` — direct connection, used by drizzle-kit
- `NEXTAUTH_SECRET`, `NEXTAUTH_URL` — NextAuth v4
- `UPLOADTHING_TOKEN` — UploadThing image uploads
- `NEXT_PUBLIC_APP_URL` — public origin; `SITE_URL` in `lib/constants.ts` reads
  it to build shareable links, so WhatsApp enquiries point at the wrong host if
  it is stale

## Architecture

**PROPERTI NUSA** is an Indonesian property listing site (rumah, apartemen,
tanah, ruko) with an agency-facing admin.

### Stack
- **Next.js 16** (App Router) + **React 19** — this version may differ from
  training data; read `node_modules/next/dist/docs/` before guessing at APIs
- **Drizzle ORM** + **Neon** serverless Postgres — client `db/index.ts`, schema `db/schema.ts`
- **NextAuth v4** (Credentials + bcrypt) — `lib/auth.ts`, handler at `app/api/auth/[...nextauth]/route.ts`
- **UploadThing** — `lib/uploadthing.ts`, route `app/api/uploadthing/route.ts`
- **Tailwind CSS v4** + **shadcn/ui** (Radix primitives) — `components/ui/`
- **Leaflet / react-leaflet** — `components/PropertyMap.tsx`, `components/LeafletMapView.tsx`

There is no dark mode: `app/globals.css` defines one palette on `:root` only.

### Design tokens
Every colour lives in `app/globals.css`. The palette is deep brown `#4A2E1C`,
warm brown `#8A5526`, sand gold `#D6A76A` and terracotta `#C06A14` over
off-white `#F9F9F9` and near-black `#1B1B1B`, mapped to roles rather than to
those names: `--primary` is terracotta and drives calls to action, `--accent` is
deep brown and carries every dark surface (footer, hero, admin sidebar,
calculator result), `--gold` is highlight only. `--radius` is `0.25rem`.

Typography is Archivo for headings (`font-heading`, `font-display`) over Inter
for body (`font-sans`), wired up in `app/layout.tsx`.

### Brand config (`lib/brand.ts`)
Every brand string — name, wordmark halves, taglines, page titles, stats,
section copy, contact details — is centralised here. Import `BRAND` or
`brandTitle()`. A rename touches this file and nothing else. Never hard-code a
brand string in a component.

`BRAND.contact.whatsapp` is deliberately empty: it is the office fallback for
the enquiry button, and an empty value hides the button rather than pointing
buyers at a number nobody answers.

### Database (`db/schema.ts`)
Seven tables: `profiles`, `properties`, `property_images`, `favorites`, `leads`,
`admin_actions`, `rate_limits`.

Enums: `role` (buyer|agent|admin), `property_type` (rumah|apartemen|tanah|ruko),
`listing_type` (jual|sewa), `status` (active|sold|rented|archived).

`profiles.title` and `profiles.bio` (migration 0008) back the public agent
profile. Both nullable, so the sibling site sharing this database is unaffected
— but if you ever run `drizzle-kit generate` from *that* repo, drizzle will see
two columns its schema does not declare and write a `DROP COLUMN` migration.
Add the same two nullable columns there before generating anything.

Migrations live in `drizzle/` (0000–0008) and are already applied to the shared
database. Generate new ones with `pnpm exec drizzle-kit generate`, then
`pnpm exec drizzle-kit migrate`.

### Routes
| Path | Purpose |
|------|---------|
| `/` | Homepage — featured active listings |
| `/properti` | Catalog with filters, sort and pagination |
| `/properti/[id]` | Detail — gallery, map, KPR simulation (sale listings), lead form, agent card |
| `/peta` | Map view of all listings |
| `/agen` | Agent index — grid of every agent with their active listing count |
| `/agen/[id]` | Public agent profile — bio, WhatsApp, and that agent's active listings |
| `/masuk`, `/daftar` | Sign in / sign up (buyer only; agents are created by an admin) |
| `/profil` | Profile and favorites |
| `/admin` | Dashboard stats |
| `/admin/properti`, `/admin/properti/create`, `/admin/properti/[id]/edit` | Property CRUD |
| `/admin/agent` | Agent management |
| `/admin/leads`, `/admin/aktivitas` | Leads inbox and admin action log |

### Key shared types (`lib/types.ts`)
`PropertyWithImages` (`Property` + `images` + optional `agentPhone`) is the shape
passed from server components into client components. `PublicAgent` is the
agent shape the public pages use, carrying a count of *visible* listings —
active and not soft-deleted — via `getPublicAgents` / `getPublicAgent`.

### Path alias
`@/` maps to the project root (`tsconfig.json`).

## Conventions and gotchas

- **Decimal columns** (`price`, `lat`, `lng`) are strings in TypeScript — parse
  before doing maths on them.
- **`getPropertiesWithImagesBatch`** (`lib/db-helpers.ts`) is the only way to
  load listings for a grid. It batches images *and* agent phone numbers, so
  adding a per-card field must not become a query per card.
- **Rate limiter** (`lib/rate-limit.ts`) picks its driver at import time: the
  `rate_limits` table when `DATABASE_URL` is set, an in-process Map otherwise.
  So it *is* shared across instances in production, and only tests and local
  runs without a database fall back to memory. Guards login at 5 attempts /
  15 min.
- **WhatsApp links** go through `buildWhatsAppLink` for a listing enquiry and
  `buildAgentWhatsAppLink` for an agent profile (`lib/whatsapp.ts`). Never
  hand-roll a `wa.me` href: an Indonesian `08xx` has to become `628xx` or the
  chat will not open.
- **`/agen` has no link into it yet** — the only route in is the agent name on a
  listing's AgentCard. Add a Navbar or Footer entry when the index should be
  discoverable.
- **KPR maths** lives in `lib/mortgage.ts` as a pure function; the component is
  presentation only.
- **Admin role** is set with SQL: `UPDATE profiles SET role = 'admin' WHERE email = '…'`.
  It rides the JWT session and is enforced in `app/admin/layout.tsx`.
- **Image domains** allowed: `images.unsplash.com`, `utfs.io`, `*.ufsedge.com`,
  `*.uploadthing.com` (`next.config.ts`).
- **`.env*` is gitignored.** Never commit secrets.
