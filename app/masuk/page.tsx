"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { signIn } from "next-auth/react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { BRAND } from "@/lib/brand"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import PasswordInput from "@/components/PasswordInput"
import BrandMark from "@/components/BrandMark"

export default function MasukPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError("")

    const result = await signIn("credentials", { email, password, redirect: false })

    if (result?.error) {
      toast.error("Email atau password salah")
      setLoading(false)
    } else {
      toast.success("Berhasil masuk")
      router.push("/")
      router.refresh()
    }
  }

  return (
    <div className="grid min-h-[calc(100vh-64px)] lg:grid-cols-2">
      <div className="relative hidden bg-primary overflow-hidden lg:block">
        <Image
          src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&h=1600&fit=crop&auto=format&q=80"
          alt=""
          fill
          priority
          className="object-cover opacity-50"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-primary/85 to-primary/40" />
        <div className="relative flex h-full flex-col items-center justify-center px-12 text-center text-primary-foreground">
          <BrandMark size="lg" inverted />
          <p className="mt-6 max-w-sm text-lg font-light italic leading-relaxed">
            Temukan properti impian Anda, di mana pun di Indonesia.
          </p>
        </div>
      </div>

      <div className="flex items-center justify-center bg-background p-6 sm:p-12">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center">
            <h1 className="font-sans text-2xl font-semibold text-foreground">Masuk</h1>
            <p className="mt-1 text-sm text-muted-foreground">{BRAND.loginDescription}</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="kamu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="rounded-xl border-border focus-visible:ring-primary"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">Password</Label>
              <PasswordInput
                id="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="rounded-xl border-border focus-visible:ring-primary"
              />
            </div>
            {error && <p className="text-[13px] text-destructive">{error}</p>}
            <Button type="submit" className="btn-press w-full rounded-xl bg-primary py-3 font-semibold text-primary-foreground hover:bg-primary/90" disabled={loading}>
              {loading ? "Memproses..." : "Masuk"}
            </Button>
          </form>
          <p className="mt-6 text-center text-sm text-muted-foreground">
            Belum punya akun?{" "}
            <Link href="/daftar" className="text-primary underline underline-offset-4 hover:text-primary/80">
              Daftar
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
