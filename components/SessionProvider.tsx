"use client"

import { createContext, useCallback, useContext, useEffect, useState } from "react"
import type { Session } from "@/lib/auth"

type Status = "loading" | "authenticated" | "unauthenticated"

interface SessionState {
  data: Session | null
  status: Status
  /** Re-reads the session — after signing in or out, or editing the profile. */
  update: () => Promise<void>
}

const SessionContext = createContext<SessionState | null>(null)

async function fetchSession(): Promise<Session | null> {
  try {
    const res = await fetch("/api/session", { cache: "no-store" })
    return res.ok ? ((await res.json()) as Session | null) : null
  } catch {
    return null
  }
}

/**
 * The signed-in user as the server sees them, role included — Neon Auth's own
 * client session has no role, which lives in `profiles`. Pass `session` to
 * start from a known value (tests) instead of fetching.
 */
export function SessionProvider({ children, session }: { children: React.ReactNode; session?: Session | null }) {
  const [data, setData] = useState<Session | null>(session ?? null)
  const [status, setStatus] = useState<Status>(
    session === undefined ? "loading" : session ? "authenticated" : "unauthenticated",
  )

  const update = useCallback(async () => {
    const next = await fetchSession()
    setData(next)
    setStatus(next ? "authenticated" : "unauthenticated")
  }, [])

  useEffect(() => {
    if (session !== undefined) return
    let live = true
    fetchSession().then((next) => {
      if (!live) return
      setData(next)
      setStatus(next ? "authenticated" : "unauthenticated")
    })
    return () => {
      live = false
    }
  }, [session])

  return <SessionContext.Provider value={{ data, status, update }}>{children}</SessionContext.Provider>
}

export function useSession(): SessionState {
  const state = useContext(SessionContext)
  if (!state) throw new Error("useSession must be used inside <SessionProvider>")
  return state
}
