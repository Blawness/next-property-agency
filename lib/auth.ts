import { NextAuthOptions, DefaultSession } from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id?: string
      role?: string
    } & DefaultSession["user"]
  }
  interface User {
    role?: string
    image?: string
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: string
    image?: string
  }
}
import CredentialsProvider from "next-auth/providers/credentials"
import { db } from "@/db"
import { profiles } from "@/db/schema"
import { eq } from "drizzle-orm"
import bcrypt from "bcryptjs"
import { isSessionStale } from "@/lib/password-reset"
import { rateLimit, getRateLimitKey } from "@/lib/rate-limit"

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, req) {
        if (!credentials?.email || !credentials?.password) return null

        const ip = req.headers?.["x-forwarded-for"] ?? "unknown"
        const key = getRateLimitKey(ip as string, "login")
        const limit = await rateLimit(key, { windowMs: 15 * 60 * 1000, max: 5 })

        if (!limit.success) {
          throw new Error("Terlalu banyak percobaan login. Coba lagi nanti.")
        }

        const [user] = await db
          .select()
          .from(profiles)
          .where(eq(profiles.email, credentials.email))
          .limit(1)

        const dummyHash = await bcrypt.hash("dummy-timing-attack-prevention", 4)

        if (!user) {
          await bcrypt.compare(credentials.password, dummyHash)
          return null
        }

        const valid = await bcrypt.compare(credentials.password, user.passwordHash)
        if (!valid) return null
        return { id: user.id, name: user.fullName, email: user.email, role: user.role ?? "buyer", image: user.avatarUrl ?? undefined }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id
        token.role = user.role
        token.image = user.image as string | undefined
        // Freshly minted at sign-in — nothing to invalidate yet, and `iat` is
        // not set until the token is encoded.
        return token
      }

      if (trigger === "update" && session?.image !== undefined) {
        token.image = session.image as string
      }

      // A password reset has to end sessions that were already open, or an
      // intruder simply keeps the one they have. Sessions are JWTs with no
      // server-side store, so the only way to notice is to compare the token's
      // issue time against the account. That costs one indexed primary-key read
      // per session read; throwing is what NextAuth turns into a cleared
      // session cookie (see core/routes/session.js).
      if (token.id) {
        const [row] = await db
          .select({ passwordChangedAt: profiles.passwordChangedAt })
          .from(profiles)
          .where(eq(profiles.id, token.id as string))
          .limit(1)

        if (isSessionStale(row?.passwordChangedAt, token.iat as number | undefined)) {
          throw new Error("Session predates a password change")
        }
      }

      return token
    },
    session({ session, token }) {
      if (token.id) session.user.id = token.id as string
      if (token.role) session.user.role = token.role as string
      if (token.image) session.user.image = token.image as string
      return session
    },
  },
  pages: {
    signIn: "/masuk",
  },
}
