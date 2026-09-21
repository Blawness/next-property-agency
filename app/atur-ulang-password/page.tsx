"use client"

import { Suspense, useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { toast } from "sonner"
import { ShieldAlert } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import PasswordInput from "@/components/PasswordInput"
import BrandMark from "@/components/BrandMark"

const MIN_PASSWORD_LENGTH = 8

function ResetForm() {
  const router = useRouter()
  const token = useSearchParams().get("token") ?? ""

  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  if (!token) {
    return (
      <div className="rounded-sm border border-border bg-card p-6 text-center">
        <ShieldAlert className="mx-auto h-8 w-8 text-destructive" aria-hidden />
        <p className="mt-3 text-[15px] font-medium text-foreground">Tautan tidak lengkap</p>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Buka halaman ini lewat tautan di email Anda, atau minta tautan baru.
        </p>
        <Button variant="outline" className="mt-5 rounded-sm" asChild>
          <Link href="/lupa-password">Minta tautan baru</Link>
        </Button>
      </div>
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")

    // Checked here as well as on the server so the mismatch is caught before a
    // round trip; the server is still the one that decides.
    if (password !== confirm) {
      setError("Konfirmasi password tidak cocok.")
      return
    }

    setLoading(true)
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error ?? "Gagal mengatur ulang password.")

      toast.success("Password berhasil diubah. Silakan masuk dengan password baru.")
      router.push("/masuk")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal mengatur ulang password.")
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <Label
          htmlFor="password"
          className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground"
        >
          Password Baru
        </Label>
        <PasswordInput
          id="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={MIN_PASSWORD_LENGTH}
          className="rounded-sm border-border focus-visible:ring-primary"
        />
        <p className="text-xs text-muted-foreground">Minimal {MIN_PASSWORD_LENGTH} karakter.</p>
      </div>

      <div className="space-y-1.5">
        <Label
          htmlFor="confirm"
          className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground"
        >
          Ulangi Password Baru
        </Label>
        <PasswordInput
          id="confirm"
          placeholder="••••••••"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          required
          minLength={MIN_PASSWORD_LENGTH}
          className="rounded-sm border-border focus-visible:ring-primary"
        />
      </div>

      {error && <p className="text-[13px] text-destructive">{error}</p>}

      <Button
        type="submit"
        disabled={loading}
        className="btn-press w-full rounded-sm bg-primary py-3 font-semibold text-primary-foreground hover:bg-primary/90"
      >
        {loading ? "Menyimpan..." : "Simpan Password Baru"}
      </Button>

      <p className="text-center text-xs text-muted-foreground">
        Mengubah password akan mengeluarkan Anda dari semua perangkat lain.
      </p>
    </form>
  )
}

export default function AturUlangPasswordPage() {
  return (
    <div className="flex min-h-[calc(100vh-64px)] items-center justify-center bg-background p-6">
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center text-center">
          <BrandMark size="md" />
          <h1 className="mt-6 font-sans text-2xl font-semibold text-foreground">
            Atur Ulang Password
          </h1>
        </div>
        {/* useSearchParams needs a Suspense boundary in the App Router. */}
        <Suspense fallback={<p className="text-center text-sm text-muted-foreground">Memuat…</p>}>
          <ResetForm />
        </Suspense>
      </div>
    </div>
  )
}
