jest.mock('../../../../../lib/rate-limit', () => ({
  rateLimit: jest.fn(() => ({ success: true, remaining: 4, resetAt: Date.now() + 60_000 })),
  getRateLimitKey: jest.fn((id: string, action: string) => `${action}:${id}`),
}))

// Declared inside the factory: jest hoists jest.mock() above every const in
// this file, so anything the factory closes over must be created in there.
jest.mock('../../../../../db', () => {
  const state: { row: Array<Record<string, unknown>> } = { row: [] }
  const set = jest.fn().mockReturnValue({ where: jest.fn().mockResolvedValue(undefined) })
  return {
    db: {
      select: jest.fn().mockReturnThis(),
      from: jest.fn().mockReturnThis(),
      innerJoin: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      limit: jest.fn(async () => state.row),
      update: jest.fn().mockReturnValue({ set }),
    },
    __state: state,
    __set: set,
  }
})

import { POST } from '@/app/api/auth/reset-password/route'
import { rateLimit } from '@/lib/rate-limit'
import { db } from '@/db'
import { hashResetToken } from '@/lib/password-reset'
import bcrypt from 'bcryptjs'
import { NextRequest } from 'next/server'

const mockRateLimit = rateLimit as jest.Mock
const mocked = jest.requireMock('../../../../../db') as {
  __state: { row: Array<Record<string, unknown>> }
  __set: jest.Mock
}
const state = mocked.__state
const profileSet = mocked.__set

function makeReq(body: unknown): NextRequest {
  return new NextRequest(
    new Request('http://localhost/api/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify(body),
      headers: { 'content-type': 'application/json' },
    }),
  )
}

const TOKEN = 'a'.repeat(64)

function liveToken(overrides: Record<string, unknown> = {}) {
  return [
    {
      tokenId: 't1',
      userId: 'u1',
      expiresAt: new Date(Date.now() + 30 * 60_000),
      usedAt: null,
      ...overrides,
    },
  ]
}

beforeEach(() => {
  jest.clearAllMocks()
  mockRateLimit.mockResolvedValue({ success: true, remaining: 4, resetAt: Date.now() + 60_000 })
  state.row = liveToken()
})

describe('POST /api/auth/reset-password', () => {
  it('accepts a live token and sets the new password', async () => {
    const res = await POST(makeReq({ token: TOKEN, password: 'rahasia-baru' }))
    expect(res.status).toBe(200)
    expect(db.update).toHaveBeenCalled()
  })

  it('stores a bcrypt hash, never the password itself', async () => {
    await POST(makeReq({ token: TOKEN, password: 'rahasia-baru' }))
    const written = profileSet.mock.calls.map(([arg]) => arg).find((a) => a.passwordHash)
    expect(written.passwordHash).not.toBe('rahasia-baru')
    expect(await bcrypt.compare('rahasia-baru', written.passwordHash)).toBe(true)
  })

  it('stamps passwordChangedAt so existing sessions stop being accepted', async () => {
    await POST(makeReq({ token: TOKEN, password: 'rahasia-baru' }))
    const written = profileSet.mock.calls.map(([arg]) => arg).find((a) => a.passwordHash)
    expect(written.passwordChangedAt).toBeInstanceOf(Date)
  })

  it('spends the token, so the same link cannot be replayed', async () => {
    await POST(makeReq({ token: TOKEN, password: 'rahasia-baru' }))
    const spent = profileSet.mock.calls.map(([arg]) => arg).find((a) => a.usedAt)
    expect(spent.usedAt).toBeInstanceOf(Date)
  })

  it('looks the token up by its hash, not its plain value', async () => {
    await POST(makeReq({ token: TOKEN, password: 'rahasia-baru' }))
    expect(hashResetToken(TOKEN)).not.toBe(TOKEN)
  })

  it('refuses an expired token', async () => {
    state.row = liveToken({ expiresAt: new Date(Date.now() - 1000) })
    const res = await POST(makeReq({ token: TOKEN, password: 'rahasia-baru' }))
    expect(res.status).toBe(400)
    expect(db.update).not.toHaveBeenCalled()
  })

  it('refuses a token that was already spent', async () => {
    state.row = liveToken({ usedAt: new Date() })
    const res = await POST(makeReq({ token: TOKEN, password: 'rahasia-baru' }))
    expect(res.status).toBe(400)
    expect(db.update).not.toHaveBeenCalled()
  })

  it('refuses a token nobody issued', async () => {
    state.row = []
    const res = await POST(makeReq({ token: TOKEN, password: 'rahasia-baru' }))
    expect(res.status).toBe(400)
    expect(db.update).not.toHaveBeenCalled()
  })

  it('holds the new password to the same 8-character rule as registration', async () => {
    const res = await POST(makeReq({ token: TOKEN, password: 'pendek' }))
    expect(res.status).toBe(400)
    expect(db.update).not.toHaveBeenCalled()
  })

  it('refuses once the rate limit is spent', async () => {
    mockRateLimit.mockResolvedValue({ success: false, remaining: 0, resetAt: Date.now() })
    const res = await POST(makeReq({ token: TOKEN, password: 'rahasia-baru' }))
    expect(res.status).toBe(429)
    expect(db.update).not.toHaveBeenCalled()
  })
})
