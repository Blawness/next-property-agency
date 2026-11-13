"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { authAttempt, authClient } from "@/lib/auth-client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import BrandMark from "@/components/BrandMark"

export default function LupaPasswordPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError("")

    // The reply is the same whether or not the address has an account, so
    // this page cannot be used to find out who is registered.
    const failure = await authAttempt(() =>
      authClient.emailOtp.sendVerificationOtp({ email, type: "forget-password" }),
    )
    if (failure) {
      setError(failure.status === 429 ? "Terlalu banyak permintaan. Coba lagi nanti." : "Gagal mengirim kode.")
      setLoading(false)
      return
    }
    router.push(`/atur-ulang-password?email=${encodeURIComponent(email)}`)
  }

  return (
    <div className="flex min-h-[calc(100vh-64px)] items-center justify-center bg-background p-6">
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center text-center">
          <BrandMark size="md" />
          <h1 className="mt-6 font-sans text-2xl font-semibold text-foreground">Lupa Password</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Masukkan email akun Anda. Kami kirim kode untuk membuat password baru.
          </p>
        </div>

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
            {loading ? "Mengirim..." : "Kirim Kode"}
          </Button>
        </form>

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
