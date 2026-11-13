"use client"

import { Suspense, useEffect, useState } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { authAttempt, authClient } from "@/lib/auth-client"
import { useSession } from "@/components/SessionProvider"
import { Button } from "@/components/ui/button"
import BrandMark from "@/components/BrandMark"
import { BRAND } from "@/lib/brand"

/**
 * Neon Auth's OAuth server sends the user here (the branch's consent page)
 * after sign-in, with a signed query naming the client — Claude's connector —
 * and what it asks for. The auth client forwards that query with `consent`,
 * which then navigates to the client's callback itself.
 */

interface PublicClient {
  client_name?: string
  client_uri?: string
}

const LOOPBACK: Record<string, true> = { localhost: true, "127.0.0.1": true, "[::1]": true }

function hostOf(uri: string): string {
  try {
    return new URL(uri).host
  } catch {
    return uri
  }
}

function Consent() {
  const params = useSearchParams()
  const clientId = params.get("client_id") ?? ""
  // Signed by Neon Auth along with the rest of the query: where the code goes.
  const redirectHost = hostOf(params.get("redirect_uri") ?? "")
  const { data: session, status } = useSession()
  const [client, setClient] = useState<PublicClient | null>(null)
  const [error, setError] = useState("")
  const [pending, setPending] = useState(false)

  useEffect(() => {
    if (status !== "authenticated" || !clientId) return
    authClient.oauth2
      .publicClient({ query: { client_id: clientId } })
      .then(({ data }) => setClient((data as PublicClient | null) ?? {}))
      .catch(() => setClient({}))
  }, [status, clientId])

  async function decide(accept: boolean) {
    setPending(true)
    setError("")
    const failure = await authAttempt(() => authClient.oauth2.consent({ accept }))
    if (failure) {
      setError("Permintaan ini sudah kedaluwarsa. Kembali ke aplikasinya dan coba hubungkan lagi.")
      setPending(false)
    }
  }

  if (status === "loading") {
    return <p className="text-center text-sm text-muted-foreground">Memuat…</p>
  }

  if (status === "unauthenticated") {
    return (
      <p className="text-center text-sm text-muted-foreground">
        Sesi masuk kamu sudah berakhir.{" "}
        <Link href={`/masuk?${params.toString()}`} className="text-primary underline underline-offset-4">
          Masuk lagi
        </Link>{" "}
        untuk melanjutkan.
      </p>
    )
  }

  const name = client?.client_name || hostOf(client?.client_uri ?? clientId)
  const loopback = Boolean(LOOPBACK[redirectHost.replace(/:\d+$/, "")])

  return (
    <div className="space-y-6">
      <p className="text-center text-sm text-foreground">
        <strong className="font-semibold">{name}</strong> meminta akses ke akun {BRAND.name}{" "}
        <strong className="font-semibold">{session?.user.email}</strong>.
      </p>

      <div className="space-y-2 rounded-xl bg-muted p-4 text-sm text-foreground">
        <p className="font-medium">Yang bisa dilakukan aplikasi ini:</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>Melihat daftar agen dan listing</li>
          <li>Memasang listing baru dan mengubah listing (harga, status, foto) atas nama kamu</li>
        </ul>
        {redirectHost && (
          <p className="pt-1 text-[13px] text-muted-foreground">Setelah diizinkan, kamu kembali ke {redirectHost}.</p>
        )}
      </div>

      {session?.user.role !== "admin" && (
        <p className="text-[13px] text-destructive">
          Akun ini bukan admin, jadi aplikasi tidak akan bisa memakai tool listing. Masuk dengan akun admin.
        </p>
      )}
      {loopback && (
        <p className="text-[13px] text-destructive">
          Aplikasi ini berjalan di komputer (localhost), misalnya Claude Code. Izinkan hanya kalau kamu sendiri yang
          baru saja menghubungkannya.
        </p>
      )}
      {error && <p className="text-[13px] text-destructive">{error}</p>}

      <div className="flex gap-3">
        <Button variant="outline" className="flex-1" disabled={pending} onClick={() => decide(false)}>
          Tolak
        </Button>
        <Button className="flex-1" disabled={pending || client === null} onClick={() => decide(true)}>
          {pending ? "Memproses…" : "Izinkan"}
        </Button>
      </div>
    </div>
  )
}

export default function PersetujuanPage() {
  return (
    <div className="flex min-h-[calc(100vh-64px)] items-center justify-center bg-background p-6">
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center text-center">
          <BrandMark size="md" />
          <h1 className="mt-6 font-sans text-2xl font-semibold text-foreground">Izinkan Akses</h1>
        </div>
        <Suspense>
          <Consent />
        </Suspense>
      </div>
    </div>
  )
}
