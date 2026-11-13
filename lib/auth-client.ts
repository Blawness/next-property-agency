"use client"

import { createAuthClient } from "@neon/auth/next"

/** Browser side of Neon Auth; talks to the same-origin proxy at /api/auth. */
export const authClient = createAuthClient()

/** Better Auth's own error code and HTTP status, e.g. `INVALID_OTP` / 400. */
export interface AuthFailure {
  code?: string
  status?: number
}

type RawError = { code?: string; status?: number; error?: { code?: string; status?: number } }

/**
 * Runs a client call and returns why it failed, or null. @neon/auth 0.8.2
 * throws an `AuthApiError` for any non-2xx response instead of returning
 * `{ error }` as its docs show, and that error's own `code`/`status` are
 * rewritten to Supabase-style values; Better Auth's originals are on `.error`.
 */
export async function authAttempt(call: () => Promise<{ error?: unknown }>): Promise<AuthFailure | null> {
  let failure: unknown
  try {
    failure = (await call()).error
  } catch (err) {
    failure = err ?? {}
  }
  if (!failure) return null
  const raw = failure as RawError
  return { code: raw.error?.code ?? raw.code, status: raw.error?.status ?? raw.status }
}
