jest.mock('../../db', () => {
  const images: Record<string, Array<{ id: string; propertyId: string; url: string; isPrimary: boolean; order: number }>> = {}
  return {
    db: {
      select: jest.fn().mockReturnThis(),
      from: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockImplementation(async () => Object.values(images).flat()),
    },
    __setImages: (data: typeof images) => { Object.keys(images).forEach((k) => delete images[k]); Object.assign(images, data) },
  }
})

import { getPropertiesWithImagesBatch } from '@/lib/db-helpers'
import type { InferSelectModel } from 'drizzle-orm'
import { properties } from '../../db/schema'

const mockDb = jest.requireMock('../../db') as {
  db: { orderBy: jest.Mock }
  __setImages: (data: any) => void
}

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
})
