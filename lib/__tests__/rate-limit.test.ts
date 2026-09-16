import { rateLimit, getRateLimitKey } from '@/lib/rate-limit'

describe('rateLimit', () => {
  beforeEach(() => {
    jest.useFakeTimers()
    jest.setSystemTime(new Date('2026-01-01T00:00:00Z'))
  })
  afterEach(() => {
    jest.useRealTimers()
  })

  it('allows up to max requests within the window', async () => {
    const key = getRateLimitKey('user-1', 'login')
    for (let i = 0; i < 5; i++) {
      expect((await rateLimit(key)).success).toBe(true)
    }
    const sixth = await rateLimit(key)
    expect(sixth.success).toBe(false)
    expect(sixth.remaining).toBe(0)
  })

  it('resets after the window elapses', async () => {
    const key = getRateLimitKey('user-2', 'login')
    for (let i = 0; i < 5; i++) await rateLimit(key)
    expect((await rateLimit(key)).success).toBe(false)
    jest.advanceTimersByTime(15 * 60 * 1000 + 1)
    expect((await rateLimit(key)).success).toBe(true)
  })

  it('isolates keys per (identifier, action)', async () => {
    expect((await rateLimit(getRateLimitKey('a', 'login'))).success).toBe(true)
    expect((await rateLimit(getRateLimitKey('a', 'register'))).success).toBe(true)
    expect((await rateLimit(getRateLimitKey('b', 'login'))).success).toBe(true)
  })

  it('returns resetAt in the future', async () => {
    const r = await rateLimit(getRateLimitKey('x', 'y'))
    expect(r.resetAt).toBeGreaterThan(Date.now())
  })
})
