export interface RateLimitDriver {
  hit(key: string, windowMs: number): Promise<{ count: number; resetAt: number }>
  reset?(key: string): Promise<void>
}

class DbDriver implements RateLimitDriver {
  async hit(key: string, windowMs: number) {
    const { db } = await import("@/db")
    const { rateLimits } = await import("@/db/schema")
    const { eq, sql } = await import("drizzle-orm")
    const now = Date.now()
    const [existing] = await db.select().from(rateLimits).where(eq(rateLimits.key, key)).limit(1)
    if (!existing || existing.resetAt.getTime() <= now) {
      const resetAt = new Date(now + windowMs)
      await db
        .insert(rateLimits)
        .values({ key, count: 1, resetAt })
        .onConflictDoUpdate({ target: rateLimits.key, set: { count: 1, resetAt } })
      return { count: 1, resetAt: now + windowMs }
    }
    const [updated] = await db
      .update(rateLimits)
      .set({ count: sql`${rateLimits.count} + 1` })
      .where(eq(rateLimits.key, key))
      .returning({ count: rateLimits.count, resetAt: rateLimits.resetAt })
    return { count: updated.count, resetAt: updated.resetAt.getTime() }
  }
  async reset(key: string) {
    const { db } = await import("@/db")
    const { rateLimits } = await import("@/db/schema")
    const { eq } = await import("drizzle-orm")
    await db.delete(rateLimits).where(eq(rateLimits.key, key))
  }
}

class MemoryDriver implements RateLimitDriver {
  private store = new Map<string, { count: number; resetAt: number }>()
  async hit(key: string, windowMs: number) {
    const now = Date.now()
    const cur = this.store.get(key)
    if (!cur || cur.resetAt <= now) {
      const entry = { count: 1, resetAt: now + windowMs }
      this.store.set(key, entry)
      return entry
    }
    cur.count += 1
    return cur
  }
  async reset(key: string) { this.store.delete(key) }
}

const driver: RateLimitDriver = process.env.DATABASE_URL
  ? new DbDriver()
  : new MemoryDriver()

export async function rateLimit(
  key: string,
  options: { windowMs?: number; max?: number } = {},
): Promise<{ success: boolean; remaining: number; resetAt: number }> {
  const { windowMs = 15 * 60 * 1000, max = 5 } = options
  const { count, resetAt } = await driver.hit(key, windowMs)
  if (count > max) return { success: false, remaining: 0, resetAt }
  return { success: true, remaining: max - count, resetAt }
}

export function getRateLimitKey(identifier: string, action: string): string {
  return `ratelimit:${action}:${identifier}`
}
