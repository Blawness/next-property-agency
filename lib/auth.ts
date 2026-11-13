import { cache } from "react"
import { createNeonAuth, type NeonAuthServerApiError } from "@neon/auth/next/server"
import { eq, sql } from "drizzle-orm"
import { db } from "@/db"
import { profiles } from "@/db/schema"

/**
 * Neon Auth (Managed Better Auth) on the `trihuni` branch. It owns accounts,
 * passwords and sessions (schema `neon_auth`); this app owns `profiles` —
 * role, phone, avatar, agent bio — joined on `profiles.auth_user_id`.
 */
export const auth = createNeonAuth({
  baseUrl: process.env.NEON_AUTH_BASE_URL!,
  cookies: { secret: process.env.NEON_AUTH_COOKIE_SECRET! },
})

type AdminResult<T> = Promise<{ data: T | null; error: NeonAuthServerApiError | null }>

/**
 * The Better Auth admin endpoints this app calls. @neon/auth 0.8.2 types
 * `auth.admin` as `unknown` — its server type is picked from a client type
 * built without the admin plugin — although the endpoints exist at runtime
 * (`API_ENDPOINTS.admin` in the package). Signatures follow
 * https://neon.com/docs/auth/guides/plugins/admin. They run with the calling
 * request's cookies, so only an admin session gets past Neon Auth.
 */
interface AdminApi {
  createUser(body: { email: string; password: string; name: string; role?: string }): AdminResult<{ user: { id: string } }>
  setUserPassword(body: { userId: string; newPassword: string }): AdminResult<{ status: boolean }>
  revokeUserSessions(body: { userId: string }): AdminResult<{ success: boolean }>
  removeUser(body: { userId: string }): AdminResult<{ success: boolean }>
}

export const authAdmin = auth.admin as AdminApi

export type Role = "buyer" | "agent" | "admin"

export interface SessionUser {
  /** `profiles.id` — what every table in this app points at. */
  id: string
  /** The Neon Auth user id, for the admin APIs. */
  authUserId: string
  email: string
  name: string
  image: string | null
  role: Role
}

export interface Session {
  user: SessionUser
}

const profileColumns = {
  id: profiles.id,
  fullName: profiles.fullName,
  avatarUrl: profiles.avatarUrl,
  role: profiles.role,
}

/**
 * The signed-in user with their profile, or null. Cached per request, so a page
 * and the components under it share one lookup.
 *
 * @neon/auth trusts its signed session cookie for up to five minutes before
 * asking Neon Auth again, so a session revoked by a password change or reset
 * would otherwise live on that long. The session row in `neon_auth.session` —
 * same database, one indexed read alongside the profile — is checked on every
 * call instead, which ends it at once.
 *
 * Sign-up happens in Neon Auth, which knows nothing of `profiles`, so the
 * first request after it creates the buyer profile. A profile is never matched
 * by email: sign-up does not verify the address, and claiming an existing
 * profile by email would hand its listings to whoever registered it first.
 */
export const getSession = cache(async (): Promise<Session | null> => {
  const { data } = await auth.getSession()
  const authUser = data?.user
  const authSession = data?.session
  if (!authUser || !authSession) return null

  const live = sql<boolean>`exists (select 1 from neon_auth.session s where s.id = ${authSession.id} and s."expiresAt" > now())`
  const byAuthUser = eq(profiles.authUserId, authUser.id)
  const [row] = await db.select({ live, profile: profileColumns }).from(profiles).where(byAuthUser).limit(1)
  if (row && !row.live) return null

  let profile = row?.profile
  if (!profile) {
    await db
      .insert(profiles)
      .values({ authUserId: authUser.id, email: authUser.email, fullName: authUser.name || authUser.email, role: "buyer" })
      .onConflictDoNothing()
    ;[profile] = await db.select(profileColumns).from(profiles).where(byAuthUser).limit(1)
  }
  if (!profile) {
    // The email belongs to a profile with no login (or another login): refuse
    // rather than guess which account this is.
    console.error(`[auth] no profile for Neon Auth user ${authUser.id}`)
    return null
  }

  return {
    user: {
      id: profile.id,
      authUserId: authUser.id,
      email: authUser.email,
      name: profile.fullName,
      image: profile.avatarUrl,
      role: profile.role ?? "buyer",
    },
  }
})
