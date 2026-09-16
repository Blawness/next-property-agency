# PROPERTI NUSA

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

Salin kredensial ke `.env.local`:

| Variabel | Keterangan |
|---|---|
| `DATABASE_URL` | Neon Postgres (pooled) |
| `DATABASE_URL_DIRECT` | koneksi langsung, dipakai drizzle-kit |
| `NEXTAUTH_SECRET` | rahasia NextAuth — `openssl rand -base64 32` |
| `NEXTAUTH_URL` | origin aplikasi, mis. `http://localhost:3001` |
| `NEXT_PUBLIC_APP_URL` | origin publik untuk link yang dibagikan |
| `UPLOADTHING_TOKEN` | token upload gambar |

> Saat ini `DATABASE_URL` masih menunjuk ke database yang sama dengan proyek
> asal, jadi listing-nya kelihatan di dua situs dan perubahan schema kena
> dua-duanya. Arahkan ke project Neon terpisah sebelum salah satu aplikasi butuh
> kolom yang tidak dipakai yang lain.

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
