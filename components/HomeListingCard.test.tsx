import { render, screen } from '@testing-library/react'
import { SessionProvider } from 'next-auth/react'
import HomeListingCard, { listingSpecs } from '@/components/HomeListingCard'
import type { PropertyWithImages } from '@/lib/types'

const base: PropertyWithImages = {
  id: '1',
  title: 'Rumah Tropis di Canggu',
  description: null,
  price: '4500000000',
  listingType: 'jual',
  type: 'rumah',
  city: 'Bali',
  address: null,
  lat: null,
  lng: null,
  images: [{ id: 'img1', propertyId: '1', url: 'test-image.jpg', isPrimary: true, order: 0 }],
  bedrooms: 4,
  bathrooms: 3,
  buildingArea: 280,
  landArea: 400,
  agentId: null,
  status: null,
  createdAt: null,
}

describe('listingSpecs', () => {
  it('joins bedrooms, bathrooms and building area', () => {
    expect(listingSpecs(base)).toBe('4 KT · 3 KM · 280 m²')
  })

  it('skips what is missing', () => {
    expect(listingSpecs({ ...base, bathrooms: null })).toBe('4 KT · 280 m²')
  })

  it('shows land area alone for tanah', () => {
    expect(listingSpecs({ ...base, type: 'tanah' })).toBe('400 m² tanah')
    expect(listingSpecs({ ...base, type: 'tanah', landArea: null })).toBe('')
  })
})

describe('HomeListingCard', () => {
  function renderCard(property: PropertyWithImages) {
    return render(
      <SessionProvider>
        <HomeListingCard property={property} />
      </SessionProvider>,
    )
  }

  it('links the title to the listing and shows city, price and type', () => {
    renderCard(base)
    expect(screen.getByRole('heading', { name: base.title }).closest('a')).toHaveAttribute(
      'href',
      '/properti/1',
    )
    expect(screen.getByText('Bali')).toBeInTheDocument()
    expect(screen.getByText(/4,5 M/)).toBeInTheDocument()
    expect(screen.getByText(/Dijual/)).toBeInTheDocument()
  })

  it('hides the WhatsApp link when neither agent nor office has a number', () => {
    renderCard(base)
    expect(screen.queryByText('WhatsApp')).not.toBeInTheDocument()
  })

  it('offers WhatsApp when the agent has a number', () => {
    renderCard({ ...base, agentPhone: '081234567890' })
    expect(screen.getByText('WhatsApp').closest('a')).toHaveAttribute(
      'href',
      expect.stringContaining('wa.me/6281234567890'),
    )
  })
})
