"use client"

import { useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="container mx-auto px-4 py-16 text-center space-y-4">
      <h2 className="text-2xl font-bold">Terjadi Kesalahan</h2>
      <p className="text-muted-foreground">
        {error.message ?? "Sesuatu tidak berjalan semestinya."}
      </p>
      <div className="flex items-center justify-center gap-3">
        <Button onClick={reset}>Coba Lagi</Button>
        <Button variant="outline" asChild>
          <Link href="/">Kembali ke Beranda</Link>
        </Button>
      </div>
    </div>
  )
}
