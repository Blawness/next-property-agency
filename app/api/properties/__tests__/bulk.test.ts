jest.mock('next-auth', () => ({ getServerSession: jest.fn() }))
jest.mock('../../../../lib/rate-limit', () => ({
  rateLimit: jest.fn(async () => ({ success: true, remaining: 9, resetAt: Date.now() + 60_000 })),
  getRateLimitKey: jest.fn((id: string, action: string) => `${action}:${id}`),
}))
jest.mock('../../../../db', () => ({
  db: {
    update: jest.fn().mockReturnValue({
      set: jest.fn().mockReturnValue({
        where: jest.fn().mockReturnValue({
          returning: jest.fn().mockResolvedValue([{ id: 'p1' }, { id: 'p2' }]),
        }),
      }),
    }),
    insert: jest.fn().mockReturnValue({ values: jest.fn().mockResolvedValue(undefined) }),
  },
}))

import { PATCH, DELETE } from '@/app/api/properties/bulk/route'
import { getServerSession } from 'next-auth'
import { NextRequest } from 'next/server'

const mockSession = getServerSession as jest.Mock
function req(body: any) {
  return new NextRequest(new Request('http://localhost/api/properties/bulk', {
    method: 'POST', body: JSON.stringify(body), headers: { 'content-type': 'application/json' },
  }))
}

describe('PATCH /api/properties/bulk', () => {
  it('403 for non-admin', async () => {
    mockSession.mockResolvedValue({ user: { role: 'buyer' } })
    const res = await PATCH(req({ ids: ['p1'], status: 'active' }) as any)
    expect(res.status).toBe(403)
  })

  it('400 on empty ids', async () => {
    mockSession.mockResolvedValue({ user: { id: 'a1', role: 'admin' } })
    const res = await PATCH(req({ ids: [], status: 'active' }) as any)
    expect(res.status).toBe(400)
  })

  it('400 on invalid status', async () => {
    mockSession.mockResolvedValue({ user: { id: 'a1', role: 'admin' } })
    const res = await PATCH(req({ ids: ['p1'], status: 'banana' }) as any)
    expect(res.status).toBe(400)
  })

  it('returns updated count', async () => {
    mockSession.mockResolvedValue({ user: { id: 'a1', role: 'admin' } })
    const res = await PATCH(req({ ids: ['p1', 'p2'], status: 'sold' }) as any)
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.updated).toBe(2)
  })
})

describe('DELETE /api/properties/bulk', () => {
  it('returns updated count', async () => {
    mockSession.mockResolvedValue({ user: { id: 'a1', role: 'admin' } })
    const res = await DELETE(req({ ids: ['p1', 'p2'] }) as any)
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.updated).toBe(2)
  })
})
