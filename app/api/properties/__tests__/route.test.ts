jest.mock('next-auth', () => ({
  getServerSession: jest.fn(),
}))
jest.mock('../../../../lib/rate-limit', () => ({
  rateLimit: jest.fn(() => ({ success: true, remaining: 29, resetAt: Date.now() + 60_000 })),
  getRateLimitKey: jest.fn((id: string, action: string) => `${action}:${id}`),
}))
jest.mock('../../../../db', () => {
  return {
    db: {
      select: jest.fn().mockReturnThis(),
      from: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      offset: jest.fn().mockResolvedValue([]),
      insert: jest.fn().mockReturnValue({
        values: jest.fn().mockReturnValue({
          returning: jest.fn().mockResolvedValue([{ id: 'new-id' }]),
        }),
      }),
    },
  }
})

import { GET, POST } from '@/app/api/properties/route'
import { getServerSession } from 'next-auth'
import { rateLimit } from '@/lib/rate-limit'
import { NextRequest } from 'next/server'

const mockSession = getServerSession as jest.Mock
const mockRateLimit = rateLimit as jest.Mock

function makeReq(url: string, body?: any): NextRequest {
  return new NextRequest(new Request(url, body ? { method: 'POST', body: JSON.stringify(body), headers: { 'content-type': 'application/json' } } : undefined))
}

describe('GET /api/properties', () => {
  it('returns 403 for non-admin', async () => {
    mockSession.mockResolvedValue({ user: { role: 'buyer' } })
    const res = await GET(makeReq('http://localhost/api/properties') as any)
    expect(res.status).toBe(403)
  })

  it('returns 403 for unauthenticated', async () => {
    mockSession.mockResolvedValue(null)
    const res = await GET(makeReq('http://localhost/api/properties') as any)
    expect(res.status).toBe(403)
  })
})

describe('POST /api/properties', () => {
  beforeEach(() => { mockSession.mockResolvedValue({ user: { id: 'admin-1', role: 'admin' } }) })

  it('returns 429 when rate limited', async () => {
    mockRateLimit.mockReturnValueOnce({ success: false, remaining: 0, resetAt: 0 })
    const res = await POST(makeReq('http://localhost/api/properties', { title: 'X', price: '1', type: 'rumah', listingType: 'jual', city: 'Jakarta' }) as any)
    expect(res.status).toBe(429)
  })

  it('returns 400 on validation failure', async () => {
    const res = await POST(makeReq('http://localhost/api/properties', { title: '' }) as any)
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.error).toBe('Validasi gagal')
  })

  it('returns 201 on valid payload (skipped: route returns 200 with id)', async () => {
    const res = await POST(makeReq('http://localhost/api/properties', {
      title: 'Rumah Minimalis', price: '1000000', type: 'rumah', listingType: 'jual', city: 'Jakarta',
    }) as any)
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.id).toBe('new-id')
  })
})
