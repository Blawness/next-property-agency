jest.mock('../../db', () => {
  // Two batched reads now share this chain — images off `property_images` and
  // agent phones off `profiles` — so the mock resolves on the table `from()`
  // was handed rather than on which chain method ended the call.
  const { profiles } = require('../../db/schema')
  const state: { images: any[]; agents: any[] } = { images: [], agents: [] }
  let current: unknown = null

  const chain: any = {
    select: jest.fn(() => chain),
    from: jest.fn((table: unknown) => {
      current = table
      return chain
    }),
    where: jest.fn(() => (current === profiles ? Promise.resolve(state.agents) : chain)),
    orderBy: jest.fn(async () => state.images),
  }

  return {
    db: chain,
    __setImages: (data: Record<string, any[]>) => {
      state.images = Object.values(data).flat()
    },
    __setAgents: (rows: any[]) => {
      state.agents = rows
    },
  }
})

import { getPropertiesWithImagesBatch } from '@/lib/db-helpers'
import type { InferSelectModel } from 'drizzle-orm'
import { properties } from '../../db/schema'

const mockDb = jest.requireMock('../../db') as {
  db: { orderBy: jest.Mock }
  __setImages: (data: any) => void
  __setAgents: (rows: any) => void
}

beforeEach(() => {
  mockDb.__setImages({})
  mockDb.__setAgents([])
})

const sampleProperty: InferSelectModel<typeof properties> = {
  id: 'p1',
  title: 'T1',
  description: null,
  price: '1000',
  type: 'rumah',
  listingType: 'jual',
  city: 'Jakarta',
  address: null,
  lat: null,
  lng: null,
  landArea: null,
  buildingArea: null,
  bedrooms: null,
  bathrooms: null,
  agentId: null,
  status: 'active',
  createdAt: null,
  updatedAt: null,
  deletedAt: null,
}

describe('getPropertiesWithImagesBatch', () => {
  it('returns empty array when no properties', async () => {
    mockDb.__setImages({})
    const result = await getPropertiesWithImagesBatch(Promise.resolve([]))
    expect(result).toEqual([])
  })

  it('attaches images to their properties by id', async () => {
    mockDb.__setImages({
      p1: [
        { id: 'i1', propertyId: 'p1', url: 'a.jpg', isPrimary: true, order: 0 },
        { id: 'i2', propertyId: 'p1', url: 'b.jpg', isPrimary: false, order: 1 },
      ],
    })
    const result = await getPropertiesWithImagesBatch(Promise.resolve([sampleProperty]))
    expect(result[0].images).toHaveLength(2)
    expect(result[0].images[0].url).toBe('a.jpg')
  })

  it('uses empty array when property has no images', async () => {
    mockDb.__setImages({})
    const result = await getPropertiesWithImagesBatch(Promise.resolve([sampleProperty]))
    expect(result[0].images).toEqual([])
  })

  it('ignores images whose propertyId is null', async () => {
    mockDb.__setImages({
      p1: [{ id: 'i1', propertyId: 'p1', url: 'a.jpg', isPrimary: true, order: 0 }],
      null: [{ id: 'i2', propertyId: null, url: 'orphan.jpg', isPrimary: false, order: 0 }],
    } as any)
    const result = await getPropertiesWithImagesBatch(Promise.resolve([sampleProperty]))
    expect(result[0].images).toHaveLength(1)
  })

  it("attaches the listing agent's phone so cards can offer WhatsApp", async () => {
    mockDb.__setAgents([{ id: 'a1', phone: '081234567890' }])
    const result = await getPropertiesWithImagesBatch(
      Promise.resolve([{ ...sampleProperty, agentId: 'a1' }]),
    )
    expect(result[0].agentPhone).toBe('081234567890')
  })

  it('leaves agentPhone null when the listing has no agent', async () => {
    const result = await getPropertiesWithImagesBatch(Promise.resolve([sampleProperty]))
    expect(result[0].agentPhone).toBeNull()
  })

  it('leaves agentPhone null when the agent row has no number on file', async () => {
    mockDb.__setAgents([{ id: 'a1', phone: null }])
    const result = await getPropertiesWithImagesBatch(
      Promise.resolve([{ ...sampleProperty, agentId: 'a1' }]),
    )
    expect(result[0].agentPhone).toBeNull()
  })
})
