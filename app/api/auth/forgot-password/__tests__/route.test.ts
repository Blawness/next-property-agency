jest.mock('../../../../../lib/rate-limit', () => ({
  rateLimit: jest.fn(() => ({ success: true, remaining: 4, resetAt: Date.now() + 60_000 })),
  getRateLimitKey: jest.fn((id: string, action: string) => `${action}:${id}`),
}))

const state: { user: Array<Record<string, unknown>> } = { user: [] }

jest.mock('../../../../../db', () => ({
  db: {
    select: jest.fn().mockReturnThis(),
    from: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    limit: jest.fn(async () => state.user),
    update: jest.fn().mockReturnValue({
      set: jest.fn().mockReturnValue({ where: jest.fn().mockResolvedValue(undefined) }),
    }),
    insert: jest.fn().mockReturnValue({ values: jest.fn().mockResolvedValue(undefined) }),
  },
}))

jest.mock('../../../../../lib/notify', () => {
  const actual = jest.requireActual('../../../../../lib/notify')
  return { ...actual, sendMail: jest.fn(async () => ({ sent: true })) }
})

import { POST } from '@/app/api/auth/forgot-password/route'
import { rateLimit } from '@/lib/rate-limit'
import { db } from '@/db'
import { NextRequest } from 'next/server'

const mockRateLimit = rateLimit as jest.Mock

function makeReq(body: unknown): NextRequest {
  return new NextRequest(
    new Request('http://localhost/api/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify(body),
      headers: { 'content-type': 'application/json' },
    }),
  )
}

beforeEach(() => {
  jest.clearAllMocks()
  mockRateLimit.mockResolvedValue({ success: true, remaining: 4, resetAt: Date.now() + 60_000 })
  state.user = []
})

describe('POST /api/auth/forgot-password', () => {
  it('issues a token when the account exists', async () => {
    state.user = [{ id: 'u1', email: 'ada@example.com', fullName: 'Ada' }]
    const res = await POST(makeReq({ email: 'ada@example.com' }))
    expect(res.status).toBe(200)
    expect(db.insert).toHaveBeenCalled()
  })

  it('answers identically for an unknown address, so it cannot be used to probe for accounts', async () => {
    state.user = [{ id: 'u1', email: 'ada@example.com', fullName: 'Ada' }]
    const known = await POST(makeReq({ email: 'ada@example.com' }))
    const knownBody = await known.json()

    jest.clearAllMocks()
    mockRateLimit.mockResolvedValue({ success: true, remaining: 4, resetAt: Date.now() + 60_000 })
    state.user = []
    const unknown = await POST(makeReq({ email: 'nobody@example.com' }))
    const unknownBody = await unknown.json()

    expect(unknown.status).toBe(known.status)
    expect(unknownBody).toEqual(knownBody)
  })

  it('writes no token for an address with no account', async () => {
    state.user = []
    await POST(makeReq({ email: 'nobody@example.com' }))
    expect(db.insert).not.toHaveBeenCalled()
  })

  it('retires any earlier unused token before issuing a new one', async () => {
    state.user = [{ id: 'u1', email: 'ada@example.com', fullName: 'Ada' }]
    await POST(makeReq({ email: 'ada@example.com' }))
    expect(db.update).toHaveBeenCalled()
  })

  it('rejects a malformed address', async () => {
    const res = await POST(makeReq({ email: 'bukan-email' }))
    expect(res.status).toBe(400)
    expect(db.insert).not.toHaveBeenCalled()
  })

  it('refuses once the rate limit is spent', async () => {
    mockRateLimit.mockResolvedValue({ success: false, remaining: 0, resetAt: Date.now() })
    const res = await POST(makeReq({ email: 'ada@example.com' }))
    expect(res.status).toBe(429)
    expect(db.insert).not.toHaveBeenCalled()
  })
})
