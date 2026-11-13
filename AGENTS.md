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
                # images and favorites first. Never run it against the
                # production database; it would take the admin account with it.
pnpm seed:listings  # additive — inserts realistic listings for existing
                # agents, skipping any title already present. Safe to re-run.
```

Verify in this order: `lint → typecheck → test → build`.

## Origin

Forked from [`next-property-catalog`](https://github.com/Blawness/next-property-catalog).
The core — schema, migrations, API routes, auth, admin, map, leads, favorites —
came across unchanged; the brand, palette, typography and two features are this
repo's own. Since 13 Nov 2026 it has its **own Neon project, `trihuni`**
(`billowing-smoke-39394305`, aws-ap-southeast-1, branch `main`); `.neon` links
the repo to it and `neon env pull` refreshes `DATABASE_URL` /
`DATABASE_URL_UNPOOLED`. Rows were copied from the old shared project
(`catalog-property`, `red-poetry-15243114`), which `next-property-catalog`
still uses — the two databases now diverge, so a schema change here touches
only this site.

Production is the Vercel project `next-property-agency` (scope
`blawness-projects`; `.vercel` links the repo), served at `trihuni.id` —
`www.trihuni.id`, `trihuni.tigaanakpropertindo.com` and
`next-property-agency.vercel.app` redirect there. Its `DATABASE_URL` /
`DATABASE_URL_DIRECT` (Production and Preview) point at the `trihuni` project;
env changes need a rebuild (`vercel redeploy <deployment-url>`). Its secrets
are Sensitive, so `vercel env pull` cannot fetch them; local values come from
Neon (`neon env pull`, `neon credentials reveal`).

Dev runs on **port 3001** so both apps can be up at once.

## Environment Variables

Required in `.env.local`:
- `DATABASE_URL` — Neon PostgreSQL connection string (pooled)
- `DATABASE_URL_DIRECT` — direct connection, used by drizzle-kit
- `NEON_AUTH_BASE_URL` — Neon Auth URL of the `trihuni` branch (`neon neon-auth
  status` prints it as Base URL)
- `NEON_AUTH_COOKIE_SECRET` — 32+ characters, signs @neon/auth's cached session
  cookie; `openssl rand -base64 32`
- `STORAGE_ENDPOINT`, `STORAGE_REGION`, `STORAGE_ACCESS_KEY_ID`,
  `STORAGE_SECRET_ACCESS_KEY` — Neon Object Storage on the `trihuni` branch
  (`lib/storage.ts`). The key pair is the `trihuni-app` credential
  (`neon credentials list`; `reveal <tokenId>` prints `token_id` /
  `s3_secret_access_key`); endpoint and region are `AWS_ENDPOINT_URL_S3` /
  `AWS_REGION` from `neon env pull`. They are not the `AWS_*` names because
  Vercel reserves `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY` and `AWS_REGION`.
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

**TRIHUNI** is an Indonesian property listing site (rumah, apartemen,
tanah, ruko) with an agency-facing admin.

### Stack
- **Next.js 16** (App Router) + **React 19** — this version may differ from
  training data; read `node_modules/next/dist/docs/` before guessing at APIs
- **Drizzle ORM** + **Neon** serverless Postgres — client `db/index.ts`, schema `db/schema.ts`
- **Neon Auth** (Managed Better Auth, `@neon/auth`) — server `lib/auth.ts`
  (`auth`, `authAdmin`, `getSession`), browser `lib/auth-client.ts`, proxy
  `app/api/auth/[...path]/route.ts`, `useSession()` from
  `components/SessionProvider.tsx` (fed by `GET /api/session`)
- **Neon Object Storage** — bucket `property-images` (`public_read`), client
  `lib/storage.ts`, upload route `app/api/upload/route.ts`, button
  `components/ImageUploadButton.tsx`, limits in `lib/upload-rules.ts`
- **Tailwind CSS v4** + **shadcn/ui** (Radix primitives) — `components/ui/`
- **Leaflet / react-leaflet** — `components/PropertyMap.tsx`, `components/LeafletMapView.tsx`

There is no dark mode: `app/globals.css` defines one palette on `:root` only.

### Design tokens
Every colour lives in `app/globals.css`. The palette is deep brown `#4A2E1C`,
warm brown `#8A5526`, sand gold `#D6A76A` and terracotta `#C06A14` on white,
with near-black `#1B1B1B` text, mapped to roles rather than to those names:
`--primary` is terracotta and drives calls to action and active states
(prices are set in the text colour); `--accent` is deep brown and carries headings and every dark surface
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
built from `components/home/`: a full-bleed `SearchHero` (`id="home"`, pulled
up under the navbar with `-mt-16`, a large curved bottom-left corner, and a
one-row search pill — location | type | jual/sewa | Cari; on a phone the pill
is the query alone), then `ListingPanel` — Dijual | Disewa shadcn `Tabs`, a
row of property-type categories (`ToggleGroup`), and a carousel of cards.
The panel switches in the browser without fetching: `app/page.tsx` loads the
newest 48 listings per listing type (two queries) and `groupByType` in
`lib/listing-groups.ts` splits them per category. Then the budget
`ListingRail` (the cheapest band from `lib/budget-ranges.ts` that has a sale
listing; left out when nothing is for sale), `PopularCities`, `BenefitsGrid`,
and `ContactCta` (`id="contact"`, the navbar's Kontak Kami target). Budget
bands stop one rupiah short of the next band because `catalogConditions`
applies price bounds inclusively.

`PropertyCard` is the one listing card everywhere — homepage rails
(`variant="rail"`, fixed 260px), catalog, agent and profile grids. It is flat
(no border, no shadow): a rounded photo with a Dijual/Disewa badge, then a
type label with its icon, the title, location, specs (`specLine`), and the
price in the text colour, with `/bulan` for rent.

On `/` the navbar is transparent, with white type, while the hero is behind
it (`components/navbar/useOverHero.ts`), and turns solid once the hero has
passed; elsewhere it is always solid. Anything that becomes the first
homepage section must slide up under the bar with `-mt-16`, or the bar will
float white-on-white. The bar is exactly 64px: its bottom rule is an inset
shadow, not a border, because a 1px border made it 65px and left a white
pixel row above the hero. Scrolling is native everywhere — there is no
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

### Brand config (`lib/brand.ts`)
Every brand string — name, logo text, taglines, page titles, stats,
section copy, contact details — is centralised here. Import `BRAND` or
`brandTitle()`. A rename touches this file and nothing else. Never hard-code a
brand string in a component.

The logo is a **placeholder** until the agency's own arrives: `BrandMark`
sets `BRAND.logo.monogram` in a terracotta square beside
`BRAND.logo.wordmark`, and `app/icon.svg` draws the same square
(`app/favicon.ico` — 16/32/48px — `app/apple-icon.png` and the PNGs in
`public/` are rendered from it). The real logo
replaces `BrandMark`'s contents and those icon files; the pages that render
`BrandMark` need no change.

`BRAND.contact.whatsapp` is deliberately empty: it is the office fallback for
the enquiry button, and an empty value hides the button rather than pointing
buyers at a number nobody answers.

### Database (`db/schema.ts`)
Seven tables: `profiles`, `properties`, `property_images`, `favorites`, `leads`,
`admin_actions`, `rate_limits`. Accounts, passwords and sessions are Neon
Auth's, in the `neon_auth` schema of the same database; `profiles.auth_user_id`
links a profile to its login (null for the seeded agents, which cannot sign in).

Enums: `role` (buyer|agent|admin), `property_type` (rumah|apartemen|tanah|ruko),
`listing_type` (jual|sewa), `status` (active|sold|rented|archived).

`profiles.title` and `profiles.bio` (migration 0008) back the public agent
profile.

Migrations live in `drizzle/` (0000–0012) and are applied to the `trihuni`
project. `drizzle.config.ts` reads `DATABASE_URL_DIRECT` from `.env.local`
(set it to the same value as `DATABASE_URL_UNPOOLED`). Generate new ones with
`pnpm exec drizzle-kit generate`, then `pnpm exec drizzle-kit migrate`.

### Routes
| Path | Purpose |
|------|---------|
| `/` | Homepage — search hero, listing rails by type and budget, cities, benefits, contact band |
| `/properti` | Catalog with filters, sort and pagination; `?view=peta` swaps the grid for the map |
| `/properti/[id]` | Detail — gallery, map, KPR simulation (sale listings), lead form, agent card |
| `/peta` | 308 to `/properti?view=peta` (a `next.config.ts` redirect, not a route) |
| `/agen` | Agent index — grid of every agent with their active listing count; linked from the homepage contact band |
| `/agen/[id]` | Public agent profile — bio, WhatsApp, and that agent's active listings |
| `/kerjasama`, `/finance`, `/studio`, `/bisnis`, `/hub`, `/tentang` | "Segera hadir" placeholders for navbar items (`app/[slug]/page.tsx`) |
| `/masuk`, `/daftar` | Sign in / sign up (buyer only; agents are created by an admin) |
| `/lupa-password`, `/atur-ulang-password` | Password reset — a 6-digit code by email (Neon Auth email OTP), then the new password |
| `/profil` | Profile and favorites |
| `/admin` | Dashboard stats |
| `/admin/properti`, `/admin/properti/create`, `/admin/properti/[id]/edit` | Property CRUD |
| `/admin/agent` | Agent management |
| `/admin/leads`, `/admin/aktivitas` | Leads inbox (WhatsApp reply per lead) and admin action log |
| `/api/mcp` | MCP server for Claude — admins post and edit listings (see below) |
| `/oauth/persetujuan` | OAuth consent page for the Claude connector (Neon Auth's consent page) |

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
  runs without a database fall back to memory. Sign-in and sign-up are not
  behind it: they go straight to Neon Auth, which rate-limits them itself.
- **WhatsApp links** go through `buildWhatsAppLink` for a listing enquiry,
  `buildAgentWhatsAppLink` for an agent profile (`lib/whatsapp.ts`), and
  `buildWhatsAppShareLink` for forwarding a listing to someone else
  (`lib/share.ts` — no recipient, so WhatsApp opens its contact picker). Never
  hand-roll a `wa.me` href: an Indonesian `08xx` has to become `628xx` or the
  chat will not open.
- **The navbar is three dropdowns** — Produk Trihuni, Trihuni Corp, Tentang
  Trihuni — from the agency's submenu brief. Labels and destinations live in
  `BRAND.navMenu`; desktop renders them with shadcn `NavigationMenu`, mobile
  as grouped lists in the Sheet. Every item goes through
  `components/navbar/NavLink.tsx`, which picks `<Link>` for routes and a plain
  `<a>` for `/#section` hash links (both were plain anchors once, so every
  visit to `/properti` reloaded the whole app shell) and forwards its props
  and ref so Radix can wrap it with `asChild`. Which item and which dropdown
  are active is decided by `isNavItemActive` / `activeNavGroup` in
  `components/navbar/nav-links.ts` — pure and unit-tested; the
  render-and-look-for-bold tests in `components/Navbar.test.tsx` stay as a
  behavioural safety net. The desktop dropdown follows Rukita's behaviour, and three
  details keep it from feeling broken: each trigger is the full 64px of the
  bar with `cursor-pointer` (Tailwind v4 leaves `<button>` on the default
  arrow), the panel starts exactly at the bar's bottom edge (shadcn's
  `mt-1.5` gap closed the menu as the pointer crossed it), and clicking an
  open trigger keeps it open (`DesktopNav` prevents Radix's toggle). Items
  carry an icon and a one-line description from `BRAND.navMenu`; the page
  behind an open menu is dimmed, never blurred. `/agen` is no longer in the navbar; it is reached
  from the homepage contact band and from listing pages.
- **Navbar items without content yet open a "Segera hadir" page.**
  `app/[slug]/page.tsx` serves only the slugs in `BRAND.comingSoon.pages`
  (`dynamicParams = false`, so any other top-level path 404s; static routes
  always win over the dynamic segment). Writing a real page means creating
  `app/<slug>/page.tsx` and removing the slug from `BRAND.comingSoon.pages`;
  `lib/__tests__/coming-soon.test.ts` fails if a navbar item is left with
  neither.
- **`navigator.share` and `navigator.clipboard` are both optional.** The first
  is absent on most desktops, the second throws outside HTTPS and in some
  in-app browsers. `ShareButton` reads them at click time, falls back to its
  own menu, and reports a failed copy rather than looking like it worked.
- **Reach for a shadcn/ui component before hand-rolling one.** Rails are
  shadcn `Carousel` (Embla), filter and jual/sewa choices are `ToggleGroup`,
  labels `Badge`, panels `Card`, dropdowns `Select`. When adding one with
  `pnpm exec shadcn add <name>`, answer **no** to overwriting `button.tsx`
  (it is customised to pills) — the CLI asks and, with stdin closed, stops
  without writing anything. New files import `cn` from the `cn` package;
  point them at `@/lib/utils` like the rest of `components/ui/`, and do not
  keep the `cn` dependency. `carousel.tsx` reads Embla's scroll state with
  `useSyncExternalStore` rather than upstream's setState-in-effect, which the
  React lint rules reject. jsdom lacks what Embla reads on mount, so
  `jest.setup.js` stubs `matchMedia`, `ResizeObserver` and
  `IntersectionObserver`.
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
- **Auth is Neon Auth; the app's role lives in `profiles`.** `getSession()`
  (`lib/auth.ts`) is the only way to read the signed-in user on the server — it
  returns `profiles.id` as `user.id`, which is what every table points at. The
  first session read after sign-up creates the buyer profile; a profile is
  never matched by email, since sign-up does not verify the address.
- **A revoked session ends at once.** @neon/auth trusts its signed session
  cookie for five minutes, so `getSession()` also checks the session row in
  `neon_auth.session` (one indexed read with the profile). Password change
  (`revokeOtherSessions`), reset (branch setting "revoke sessions on password
  reset") and an admin's agent reset all revoke sessions, and this check is
  what makes that immediate.
- **@neon/auth 0.8.2 quirks.** The browser client throws `AuthApiError` on any
  non-2xx instead of returning `{ error }`; wrap calls in `authAttempt()`
  (`lib/auth-client.ts`), which returns Better Auth's own `code`/`status`. On
  the server, errors come back with Supabase-style codes (`INVALID_PASSWORD`
  becomes `invalid_credentials`). `auth.admin` is typed `unknown`; use
  `authAdmin`, which types the four endpoints the app calls.
- **Password reset never confirms whether an address is registered.** Neon
  Auth answers the code request the same either way. Codes are emailed from
  Neon's shared sender (`auth@mail.myneon.app`) until a custom SMTP provider is
  set (`neon neon-auth config email-provider`).
- **Generate temp passwords with `generateTempPassword`**
  (`lib/temp-password.ts`), never `Math.random()` — its output is predictable,
  and the password grants panel access.
- **An admin needs two roles**: `profiles.role = 'admin'` (the app) and the
  Neon Auth role `admin` (`neon neon-auth user set-role <auth user id> --roles
  admin`), without which creating, resetting or deleting an agent's login is
  refused by Neon Auth. Pages enforce it in `app/admin/AdminLayoutClient.tsx`,
  API routes in each handler.
- **Uploads are one file per request through `POST /api/upload`.** Vercel caps
  a function's request body at 4.5MB, so batching would break at two photos.
  The route requires a session, enforces `UPLOAD_KINDS` (listing photos 4MB,
  avatars 2MB) and takes the stored Content-Type from the file's signature
  (`sniffImageType`), never from the browser — the bucket serves objects with
  that type to anyone, so an HTML file labelled `image/png` must not get in.
  Keys are `<folder>/<user id>/<uuid>.<ext>`, never reused, and stored with an
  immutable `Cache-Control`; the full public URL goes in the database.
- **Image domains** allowed: `images.unsplash.com` (seed listings) and Neon
  storage `**.aws.neon.tech/property-images/**` (`next.config.ts`).
- **The MCP server (`/api/mcp`) is how Claude posts listings.** Claude adds
  `https://trihuni.id/api/mcp` as a custom connector and signs in through
  Neon Auth's OAuth 2.1 server (branch config: `neon neon-auth config
  oauth-server get` — login page `/masuk`, consent page
  `/oauth/persetujuan`, MCP resource `https://trihuni.id/api/mcp`, CIMD on,
  so Claude registers no client). `/masuk` resumes a signed `sig` query with
  `oauth2.continue`; the consent page calls `oauth2.consent`. The token's
  `aud` must equal `MCP_RESOURCE` (`lib/mcp/auth.ts`, built from
  `NEXT_PUBLIC_APP_URL`), so that variable and `--mcp-resource` must name the
  same host. Only `profiles.role = 'admin'` may call the tools
  (`app/api/mcp/route.ts`); they live in `lib/mcp/server.ts` and write through
  `lib/admin-properties.ts`, the same code as the admin REST routes, so a
  listing from Claude obeys the form's rules. Claude sends photo links, not
  files: `lib/remote-image.ts` downloads each into the bucket under the
  `POST /api/upload` rules. MCP writes are logged in `admin_actions` with
  `{"via":"claude"}`. To test locally, point the branch's OAuth config at
  `http://localhost:3001` (login, consent, resource) and back afterwards — a
  branch has one MCP resource.
- **`.env*` is gitignored.** Never commit secrets.
