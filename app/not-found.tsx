import Link from "next/link"
import { SearchX } from "lucide-react"
import { Button } from "@/components/ui/button"
import { BRAND } from "@/lib/brand"

export default function NotFound() {
  return (
    <div className="container mx-auto flex min-h-[60vh] flex-col items-center justify-center px-4 py-20 text-center">
      <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border-2 border-primary text-primary">
        <SearchX size={36} strokeWidth={1.5} />
      </div>
      <p className="mt-6 text-[11px] font-semibold uppercase tracking-[0.22em] text-primary">
        {BRAND.name}
      </p>
      <h1 className="mt-2 font-sans text-3xl font-bold text-foreground sm:text-4xl">
        Halaman tidak ditemukan
      </h1>
      <p className="mt-3 max-w-md text-sm text-muted-foreground">
        Properti yang kamu cari mungkin sudah terjual, dihapus, atau tautannya salah.
        Yuk, jelajahi listing lain yang masih tersedia.
      </p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Button asChild className="rounded-xl bg-primary px-6 text-primary-foreground hover:bg-primary/90">
          <Link href="/properti">Jelajahi Katalog</Link>
        </Button>
        <Button asChild variant="outline" className="rounded-xl px-6">
          <Link href="/">Kembali ke Beranda</Link>
        </Button>
      </div>
    </div>
  )
}
