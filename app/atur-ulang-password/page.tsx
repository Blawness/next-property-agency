"use client"

import { Suspense, useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import PasswordInput from "@/components/PasswordInput"
import BrandMark from "@/components/BrandMark"
import { authAttempt, authClient } from "@/lib/auth-client"

const MIN_PASSWORD_LENGTH = 8
const LABEL_CLASS = "text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground"

function ResetForm() {
  const router = useRouter()
  const [email, setEmail] = useState(useSearchParams().get("email") ?? "")
  const [otp, setOtp] = useState("")
  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

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
    const failure = await authAttempt(() =>
      authClient.emailOtp.resetPassword({ email, otp: otp.trim(), password }),
    )
    if (failure) {
      setError(
        failure.status === 429
          ? "Terlalu banyak percobaan. Minta kode baru."
          : "Kode salah atau sudah kedaluwarsa. Periksa lagi, atau minta kode baru.",
      )
      setLoading(false)
      return
    }

    toast.success("Password berhasil diubah. Silakan masuk dengan password baru.")
    router.push("/masuk")
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <p className="text-center text-sm text-muted-foreground">
        Jika email tersebut terdaftar, kami sudah mengirim kode 6 digit ke sana.
      </p>

      <div className="space-y-1.5">
        <Label htmlFor="email" className={LABEL_CLASS}>
          Email
        </Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="rounded-sm border-border focus-visible:ring-primary"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="otp" className={LABEL_CLASS}>
          Kode dari Email
        </Label>
        <Input
          id="otp"
          inputMode="numeric"
          autoComplete="one-time-code"
          placeholder="123456"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          required
          className="rounded-sm border-border tracking-[0.3em] focus-visible:ring-primary"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="password" className={LABEL_CLASS}>
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
        <Label htmlFor="confirm" className={LABEL_CLASS}>
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
        Mengubah password akan mengeluarkan Anda dari semua perangkat lain.{" "}
        <Link href="/lupa-password" className="underline underline-offset-4 hover:text-primary">
          Minta kode baru
        </Link>
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
