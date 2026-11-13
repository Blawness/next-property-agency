# TRIHUNI

Katalog properti Indonesia — rumah, apartemen, tanah, dan ruko — lengkap dengan
peta, form lead, dan panel admin untuk agen.

Fork dari [`next-property-catalog`](https://github.com/Blawness/next-property-catalog).
Core-nya sama (schema, auth, API, admin, peta); yang berbeda adalah brand,
palet, tipografi, plus simulasi KPR dan tombol WhatsApp.

## Menjalankan

```bash
pnpm install
pnpm dev
```

Buka <http://localhost:3001>. Port 3001 dipilih supaya bisa nyala berbarengan
dengan proyek asalnya.

Repo ini sudah di-link ke project Neon `trihuni` (`.neon`), jadi `neon env pull`
mengisi `DATABASE_URL` dan `DATABASE_URL_UNPOOLED`. Sisanya isi sendiri di
`.env.local`:

| Variabel | Keterangan |
|---|---|
| `DATABASE_URL` | Neon Postgres (pooled) |
| `DATABASE_URL_DIRECT` | koneksi langsung, dipakai drizzle-kit — samakan dengan `DATABASE_URL_UNPOOLED` |
| `NEXTAUTH_SECRET` | rahasia NextAuth — `openssl rand -base64 32` |
| `NEXTAUTH_URL` | origin aplikasi, mis. `http://localhost:3001` |
| `NEXT_PUBLIC_APP_URL` | origin publik untuk link yang dibagikan |
| `STORAGE_ENDPOINT`, `STORAGE_REGION` | Neon Object Storage — nilai `AWS_ENDPOINT_URL_S3` / `AWS_REGION` dari `neon env pull` |
| `STORAGE_ACCESS_KEY_ID`, `STORAGE_SECRET_ACCESS_KEY` | credential `trihuni-app` — `neon credentials reveal <tokenId>` |

Database dan foto sudah terpisah dari proyek asal; detailnya di
[`AGENTS.md`](AGENTS.md).

## Perintah

```bash
pnpm dev        # dev server (port 3001)
pnpm build      # build produksi
pnpm lint       # ESLint
pnpm typecheck  # tsc --noEmit
pnpm test       # Jest
pnpm seed       # isi database dengan data contoh
```

## Mengganti brand

Semua teks brand ada di [`lib/brand.ts`](lib/brand.ts) — nama, wordmark,
tagline, judul halaman, statistik, dan kontak. Ganti di satu file itu saja.

Warna dan radius ada di [`app/globals.css`](app/globals.css); font diatur di
[`app/layout.tsx`](app/layout.tsx).

Isi `BRAND.contact.whatsapp` untuk menyalakan nomor kantor sebagai fallback
tombol WhatsApp ketika agen listing belum punya nomor.

## Dokumentasi

[`AGENTS.md`](AGENTS.md) — arsitektur, skema database, daftar route, dan
konvensi yang perlu diikuti sebelum mengubah kode.
