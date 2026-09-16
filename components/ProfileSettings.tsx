"use client"

import { useEffect, useState, type FormEvent } from "react"
import { useSession } from "next-auth/react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import PasswordInput from "@/components/PasswordInput"

// Mirrors the server rule in app/api/profil/route.ts.
const MIN_PASSWORD_LENGTH = 8

async function patchProfile(payload: Record<string, string>): Promise<void> {
  const res = await fetch("/api/profil", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.error ?? "Gagal menyimpan perubahan")
  }
}

export default function ProfileSettings() {
  const { update } = useSession()
  const [loading, setLoading] = useState(true)
  const [savingIdentity, setSavingIdentity] = useState(false)
  const [savingPassword, setSavingPassword] = useState(false)
  const [identity, setIdentity] = useState({ fullName: "", phone: "" })
  const [passwords, setPasswords] = useState({ current: "", next: "", confirm: "" })

  useEffect(() => {
    let cancelled = false
    fetch("/api/profil")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!cancelled && data) {
          setIdentity({ fullName: data.fullName ?? "", phone: data.phone ?? "" })
        }
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  async function saveIdentity(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (savingIdentity) return
    setSavingIdentity(true)
    try {
      await patchProfile({ fullName: identity.fullName, phone: identity.phone })
      // Keep the JWT-backed session in sync so the navbar name updates immediately.
      await update({ name: identity.fullName })
      toast.success("Profil diperbarui")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal menyimpan perubahan")
    } finally {
      setSavingIdentity(false)
    }
  }

  async function savePassword(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (savingPassword) return
    if (passwords.next !== passwords.confirm) {
      toast.error("Konfirmasi password tidak cocok")
      return
    }
    setSavingPassword(true)
    try {
      await patchProfile({ currentPassword: passwords.current, newPassword: passwords.next })
      setPasswords({ current: "", next: "", confirm: "" })
      toast.success("Password berhasil diganti")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal mengganti password")
    } finally {
      setSavingPassword(false)
    }
  }

  if (loading) {
    return <Skeleton className="h-64 w-full rounded-3xl" />
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <form
        onSubmit={saveIdentity}
        className="space-y-4 rounded-3xl border border-border/40 bg-secondary/60 p-6"
      >
        <h2 className="font-sans text-lg font-semibold text-foreground">Data Diri</h2>

        <div className="space-y-1">
          <Label htmlFor="fullName">Nama Lengkap</Label>
          <Input
            id="fullName"
            required
            minLength={2}
            className="rounded-xl bg-background"
            value={identity.fullName}
            onChange={(e) => setIdentity((p) => ({ ...p, fullName: e.target.value }))}
          />
        </div>

        <div className="space-y-1">
          <Label htmlFor="phone">Nomor Telepon</Label>
          <Input
            id="phone"
            type="tel"
            placeholder="08123456789"
            className="rounded-xl bg-background"
            value={identity.phone}
            onChange={(e) => setIdentity((p) => ({ ...p, phone: e.target.value }))}
          />
        </div>

        <Button type="submit" disabled={savingIdentity} className="rounded-xl">
          {savingIdentity ? "Menyimpan..." : "Simpan Perubahan"}
        </Button>
      </form>

      <form
        onSubmit={savePassword}
        className="space-y-4 rounded-3xl border border-border/40 bg-secondary/60 p-6"
      >
        <h2 className="font-sans text-lg font-semibold text-foreground">Ganti Password</h2>

        <div className="space-y-1">
          <Label htmlFor="currentPassword">Password Lama</Label>
          <PasswordInput
            id="currentPassword"
            required
            autoComplete="current-password"
            className="rounded-xl bg-background"
            value={passwords.current}
            onChange={(e) => setPasswords((p) => ({ ...p, current: e.target.value }))}
          />
        </div>

        <div className="space-y-1">
          <Label htmlFor="newPassword">Password Baru</Label>
          <PasswordInput
            id="newPassword"
            required
            minLength={MIN_PASSWORD_LENGTH}
            autoComplete="new-password"
            className="rounded-xl bg-background"
            value={passwords.next}
            onChange={(e) => setPasswords((p) => ({ ...p, next: e.target.value }))}
          />
          <p className="text-xs text-muted-foreground">Minimal {MIN_PASSWORD_LENGTH} karakter.</p>
        </div>

        <div className="space-y-1">
          <Label htmlFor="confirmPassword">Konfirmasi Password Baru</Label>
          <PasswordInput
            id="confirmPassword"
            required
            minLength={MIN_PASSWORD_LENGTH}
            autoComplete="new-password"
            className="rounded-xl bg-background"
            value={passwords.confirm}
            onChange={(e) => setPasswords((p) => ({ ...p, confirm: e.target.value }))}
          />
        </div>

        <Button type="submit" disabled={savingPassword} className="rounded-xl">
          {savingPassword ? "Menyimpan..." : "Ganti Password"}
        </Button>
      </form>
    </div>
  )
}
