# AGENTS.md — next-property-agency

Guidance for coding agents (Claude Code, Codex, opencode) working in this repo.

## Commands

```bash
pnpm dev        # dev server on http://localhost:3001
pnpm build      # production build
pnpm lint       # ESLint
pnpm typecheck  # tsc --noEmit
pnpm test       # Jest (jsdom, setup via jest.setup.js)
pnpm seed       # DESTRUCTIVE — db/seed.ts truncates profiles, properties,
                # images and favorites first. Never run it against the shared
                # database; it would take the admin account with it.
pnpm seed:listings  # additive — inserts realistic listings for existing
                # agents, skipping any title already present. Safe to re-run.
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

Optional:
- `RESEND_API_KEY` — lead notification email. Unset, `lib/notify.ts` logs and
  skips, so local work needs no account.
- `LEAD_NOTIFY_FROM` — sender address, defaults to `onboarding@resend.dev`.
  That default only delivers to the Resend account owner; a real sender needs a
  domain verified in Resend.

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
The homepage alone adds Cormorant Garamond (`font-serif`) for its display
lines, Pinyon Script (`font-script`, not preloaded) for the single accent word
under the hero headline, and `--ivory` for its alternating bands — the landing reads as a
residence brochure, the rest of the app as a catalogue. Its sections share one
editorial pattern: a numbered eyebrow (`01`–`05`), a light serif heading, and
`Reveal effect="drift"` / `"unveil"` for slower entrances than the app's
default `rise`.

On `/` the navbar is transparent while the hero is behind it
(`components/navbar/useOverHero.ts`); the hero pulls itself up under the bar
with `-mt-16`. Anything that becomes the first homepage section must do the
same, or the bar will float white-on-white.

Scroll motion on `/` is `components/HomeMotion.tsx`: Lenis smooth scrolling
plus GSAP ScrollTrigger, mounted by the homepage alone so the catalogue, map
and admin keep native scrolling. Sections stay server components and opt in
with data attributes — `data-parallax` (an image layer drifting in a frame
that clips), `data-split` (letters flip in; `="words"` for long lines),
`data-hero-zoom` / `data-hero-fade`, and `data-footer-clip` (the last
section, clipped into a card as the footer rises). `#home` is a 220svh scroll
area with the hero screen pinned inside it while the photo zooms; it collapses
to one screen under `prefers-reduced-motion`, where HomeMotion does nothing.
The contact section sits on a `bg-accent` wrapper so the card shrinks onto the
footer's colour; whatever becomes the last homepage section needs the same.

Homepage listings use `HomeListingCard` (tall photo, serif title, quiet
price); `PropertyCard` stays on the catalogue and agent pages, where a denser
card suits scanning a long grid. The manifesto band's photograph is
`BRAND.manifesto.image`, deliberately not a listing photo.

### Brand config (`lib/brand.ts`)
Every brand string — name, wordmark halves, taglines, page titles, stats,
section copy, contact details — is centralised here. Import `BRAND` or
`brandTitle()`. A rename touches this file and nothing else. Never hard-code a
brand string in a component.

`BRAND.contact.whatsapp` is deliberately empty: it is the office fallback for
the enquiry button, and an empty value hides the button rather than pointing
buyers at a number nobody answers.

### Database (`db/schema.ts`)
Eight tables: `profiles`, `properties`, `property_images`, `favorites`, `leads`,
`admin_actions`, `rate_limits`, `password_reset_tokens`.

Enums: `role` (buyer|agent|admin), `property_type` (rumah|apartemen|tanah|ruko),
`listing_type` (jual|sewa), `status` (active|sold|rented|archived).

`profiles.title` and `profiles.bio` (migration 0008) back the public agent
profile. Both nullable, so the sibling site sharing this database is unaffected
— but if you ever run `drizzle-kit generate` from *that* repo, drizzle will see
two columns its schema does not declare and write a `DROP COLUMN` migration.
Add the same two nullable columns there before generating anything.

Migrations live in `drizzle/` (0000–0010) and are already applied to the shared
database. Generate new ones with `pnpm exec drizzle-kit generate`, then
`pnpm exec drizzle-kit migrate`.

### Routes
| Path | Purpose |
|------|---------|
| `/` | Homepage — featured active listings |
| `/properti` | Catalog with filters, sort and pagination; `?view=peta` swaps the grid for the map |
| `/properti/[id]` | Detail — gallery, map, KPR simulation (sale listings), lead form, agent card |
| `/peta` | 308 to `/properti?view=peta` (a `next.config.ts` redirect, not a route) |
| `/agen` | Agent index — grid of every agent with their active listing count; linked from the Navbar |
| `/agen/[id]` | Public agent profile — bio, WhatsApp, and that agent's active listings |
| `/masuk`, `/daftar` | Sign in / sign up (buyer only; agents are created by an admin) |
| `/lupa-password`, `/atur-ulang-password` | Password reset — request a link, then set a new password |
| `/profil` | Profile and favorites |
| `/admin` | Dashboard stats |
| `/admin/properti`, `/admin/properti/create`, `/admin/properti/[id]/edit` | Property CRUD |
| `/admin/agent` | Agent management |
| `/admin/leads`, `/admin/aktivitas` | Leads inbox (WhatsApp reply per lead) and admin action log |

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
- **The catalog filter lives in one place.** `lib/catalog-query.ts` parses the
  URL (`parseCatalogFilters`) and builds the WHERE clause (`catalogConditions`);
  the list and the map both read it, so a filter can never apply to one and not
  the other. Add a filter there, not in the page.
- **The map is not paginated.** The list is capped at `CATALOG_PAGE_SIZE`, the
  map at `MAP_MARKER_LIMIT` with no offset — drawing only the current page's
  pins would under-report what a search found. Listings without lat/lng cannot
  be drawn at all, so `MapCoverageNotice` says how many are missing rather than
  letting the map quietly show fewer.
- **Rate limiter** (`lib/rate-limit.ts`) picks its driver at import time: the
  `rate_limits` table when `DATABASE_URL` is set, an in-process Map otherwise.
  So it *is* shared across instances in production, and only tests and local
  runs without a database fall back to memory. Guards login at 5 attempts /
  15 min.
- **WhatsApp links** go through `buildWhatsAppLink` for a listing enquiry,
  `buildAgentWhatsAppLink` for an agent profile (`lib/whatsapp.ts`), and
  `buildWhatsAppShareLink` for forwarding a listing to someone else
  (`lib/share.ts` — no recipient, so WhatsApp opens its contact picker). Never
  hand-roll a `wa.me` href: an Indonesian `08xx` has to become `628xx` or the
  chat will not open.
- **Navbar links go through `components/navbar/NavLink.tsx`**, which picks
  `<Link>` for routes and a plain `<a>` for `/#section` hash links. Both were
  plain anchors once, so every visit to `/properti` or `/agen` reloaded the
  whole app shell. Keep the choice in that one component rather than in the
  desktop bar and the mobile drawer separately. `isNavLinkActive` in
  `components/navbar/nav-links.ts` is pure and unit-tested; the older
  render-and-look-for-bold tests in `components/Navbar.test.tsx` stay as a
  behavioural safety net.
- **`navigator.share` and `navigator.clipboard` are both optional.** The first
  is absent on most desktops, the second throws outside HTTPS and in some
  in-app browsers. `ShareButton` reads them at click time, falls back to its
  own menu, and reports a failed copy rather than looking like it worked.
- **KPR maths** lives in `lib/mortgage.ts` as a pure function; the component is
  presentation only.
- **A streamed `notFound()` returns HTTP 200, and that is correct.** Dynamic
  routes like `/properti/[id]` and `/agen/[id]` answer 200 for a missing id
  while rendering the not-found UI, because headers are already sent once
  streaming begins. Next injects `<meta name="robots" content="noindex">`, so
  these are not indexed — verified, not assumed. Do not "fix" this: a real 404
  would need an existence check in `proxy.ts` before the body streams, i.e. a
  database query on every listing and agent request. See
  `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/loading.md`
  under Status Codes.
- **Lead notification is best-effort.** `POST /api/leads` commits the row, then
  emails. A mail failure is logged and the request still returns ok — answering
  500 after a successful insert would only make the visitor submit again and
  duplicate the lead.
- **`leads.phone` is required by the API, nullable in the database.** Rows
  written before migration 0009 have none, and `leads.email` is now optional —
  phone is the contact that matters in this market.
- **Password reset never confirms whether an address is registered.**
  `POST /api/auth/forgot-password` returns the same body either way; telling
  them apart would make it a way to enumerate accounts. Reset tokens are stored
  as a SHA-256 hash, live one hour, and are spent on first use.
- **A password change ends other sessions**, via `profiles.passwordChangedAt`.
  Sessions are JWTs with no server-side store, so the `jwt` callback compares
  the token's `iat` against that column and throws when it is older — NextAuth
  turns a throw there into a cleared session cookie (see
  `node_modules/next-auth/core/routes/session.js`). This costs one indexed
  primary-key read per session read, and it is what stops an intruder keeping
  the session they already had.
- **Generate secrets with `generateTempPassword` / `generateResetToken`**
  (`lib/password-reset.ts`), never `Math.random()` — its output is predictable,
  and these values grant account access.
- **Admin role** is set with SQL: `UPDATE profiles SET role = 'admin' WHERE email = '…'`.
  It rides the JWT session and is enforced in `app/admin/layout.tsx`.
- **Image domains** allowed: `images.unsplash.com`, `utfs.io`, `*.ufsedge.com`,
  `*.uploadthing.com` (`next.config.ts`).
- **`.env*` is gitignored.** Never commit secrets.
