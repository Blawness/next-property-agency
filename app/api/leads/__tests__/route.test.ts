jest.mock('../../../../lib/rate-limit', () => ({
  rateLimit: jest.fn(() => ({ success: true, remaining: 4, resetAt: Date.now() + 60_000 })),
  getRateLimitKey: jest.fn((id: string, action: string) => `${action}:${id}`),
}))

jest.mock('../../../../db', () => ({
  db: {
    select: jest.fn().mockReturnThis(),
    from: jest.fn().mockReturnThis(),
    leftJoin: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    limit: jest.fn().mockResolvedValue([
      { title: 'Rumah 2 Lantai Bintaro', agentEmail: 'agen@kantor.id' },
    ]),
    insert: jest.fn().mockReturnValue({
      values: jest.fn().mockResolvedValue(undefined),
    }),
  },
}))

jest.mock('../../../../lib/notify', () => {
  const actual = jest.requireActual('../../../../lib/notify')
  return { ...actual, sendLeadNotification: jest.fn(async () => ({ sent: true })) }
})

import { POST } from '@/app/api/leads/route'
import { rateLimit } from '@/lib/rate-limit'
import { sendLeadNotification } from '@/lib/notify'
import { db } from '@/db'
import { NextRequest } from 'next/server'

const mockRateLimit = rateLimit as jest.Mock
const mockSend = sendLeadNotification as jest.Mock

function makeReq(body: unknown): NextRequest {
  return new NextRequest(
    new Request('http://localhost/api/leads', {
      method: 'POST',
      body: JSON.stringify(body),
      headers: { 'content-type': 'application/json' },
    }),
  )
}

const validLead = {
  name: 'Rina Kusuma',
  phone: '081234567890',
  message: 'Apakah masih tersedia untuk kunjungan akhir pekan?',
  propertyId: 'p1',
}

beforeEach(() => {
  jest.clearAllMocks()
  mockRateLimit.mockResolvedValue({ success: true, remaining: 4, resetAt: Date.now() + 60_000 })
  mockSend.mockResolvedValue({ sent: true })
})

describe('POST /api/leads', () => {
  it('accepts a lead with a phone and no email', async () => {
    const res = await POST(makeReq(validLead))
    expect(res.status).toBe(200)
    expect(db.insert).toHaveBeenCalled()
  })

  it('rejects a lead with no phone', async () => {
    const res = await POST(makeReq({ ...validLead, phone: undefined }))
    expect(res.status).toBe(400)
    expect(db.insert).not.toHaveBeenCalled()
  })

  it('rejects a phone number that cannot be dialled', async () => {
    const res = await POST(makeReq({ ...validLead, phone: '12345' }))
    expect(res.status).toBe(400)
    expect(db.insert).not.toHaveBeenCalled()
  })

  it('accepts a lead that also carries an email', async () => {
    const res = await POST(makeReq({ ...validLead, email: 'rina@example.com' }))
    expect(res.status).toBe(200)
  })

  it('rejects a malformed email when one is given', async () => {
    const res = await POST(makeReq({ ...validLead, email: 'bukan-email' }))
    expect(res.status).toBe(400)
  })

  it('notifies the listing agent and the office', async () => {
    await POST(makeReq(validLead))
    expect(mockSend).toHaveBeenCalledTimes(1)
    const [recipients] = mockSend.mock.calls[0]
    expect(recipients).toContain('agen@kantor.id')
  })

  it('still succeeds when the notification fails — the lead is already saved', async () => {
    mockSend.mockRejectedValue(new Error('resend is down'))
    const res = await POST(makeReq(validLead))
    expect(res.status).toBe(200)
    expect(db.insert).toHaveBeenCalled()
  })

  it('refuses when the rate limit is spent', async () => {
    mockRateLimit.mockResolvedValue({ success: false, remaining: 0, resetAt: Date.now() })
    const res = await POST(makeReq(validLead))
    expect(res.status).toBe(429)
    expect(db.insert).not.toHaveBeenCalled()
  })
})
