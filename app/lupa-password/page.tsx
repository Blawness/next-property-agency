"use client"

import { useState } from "react"
import Link from "next/link"
import { MailCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import BrandMark from "@/components/BrandMark"

export default function LupaPasswordPage() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error ?? "Gagal mengirim permintaan.")
      setSent(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal mengirim permintaan.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-64px)] items-center justify-center bg-background p-6">
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center text-center">
          <BrandMark size="md" />
          <h1 className="mt-6 font-sans text-2xl font-semibold text-foreground">Lupa Password</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Masukkan email akun Anda. Kami kirim tautan untuk membuat password baru.
          </p>
        </div>

        {sent ? (
          <div className="rounded-sm border border-border bg-card p-6 text-center">
            <MailCheck className="mx-auto h-8 w-8 text-primary" aria-hidden />
            <p className="mt-3 text-[15px] font-medium text-foreground">Periksa email Anda</p>
            {/* Deliberately non-committal: confirming that an address is
                registered would let anyone probe for accounts. */}
            <p className="mt-1.5 text-sm text-muted-foreground">
              Jika email tersebut terdaftar, kami sudah mengirim tautan untuk mengatur ulang
              password. Tautannya berlaku 1 jam.
            </p>
            <Button variant="outline" className="mt-5 rounded-sm" asChild>
              <Link href="/masuk">Kembali ke halaman masuk</Link>
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label
                htmlFor="email"
                className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground"
              >
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="kamu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="rounded-sm border-border focus-visible:ring-primary"
              />
            </div>
            {error && <p className="text-[13px] text-destructive">{error}</p>}
            <Button
              type="submit"
              disabled={loading}
              className="btn-press w-full rounded-sm bg-primary py-3 font-semibold text-primary-foreground hover:bg-primary/90"
            >
              {loading ? "Mengirim..." : "Kirim Tautan"}
            </Button>
          </form>
        )}

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Ingat password Anda?{" "}
          <Link href="/masuk" className="text-primary underline underline-offset-4 hover:text-primary/80">
            Masuk
          </Link>
        </p>
      </div>
    </div>
  )
}
