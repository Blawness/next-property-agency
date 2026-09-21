import { render, screen } from '@testing-library/react'
import { SessionProvider } from 'next-auth/react'
import PropertyCard from '@/components/PropertyCard'
import type { PropertyWithImages } from '@/lib/types'

function renderWithSession(ui: React.ReactElement) {
  return render(<SessionProvider>{ui}</SessionProvider>)
}

const mockProperty: PropertyWithImages = {
  id: '1',
  title: 'Test Property',
  description: null,
  price: '1000000000',
  listingType: 'jual',
  type: 'rumah',
  city: 'Jakarta',
  address: null,
  lat: null,
  lng: null,
  images: [{ id: 'img1', propertyId: '1', url: 'test-image.jpg', isPrimary: true, order: 0 }],
  bedrooms: 3,
  bathrooms: 2,
  buildingArea: 100,
  landArea: 200,
  agentId: null,
  status: null,
  createdAt: null,
}

describe('PropertyCard', () => {
  it('renders property title', () => {
    renderWithSession(<PropertyCard property={mockProperty} />)
    expect(screen.getByText('Test Property')).toBeInTheDocument()
  })

  it('formats a whole billion without a trailing decimal', () => {
    renderWithSession(<PropertyCard property={mockProperty} />)
    expect(screen.getByText('1 M')).toBeInTheDocument()
    expect(screen.getByText('Rp')).toBeInTheDocument()
  })

  it('keeps the decimal on a fractional billion, with an Indonesian comma', () => {
    renderWithSession(<PropertyCard property={{ ...mockProperty, price: '1500000000' }} />)
    expect(screen.getByText('1,5 M')).toBeInTheDocument()
  })

  it('offers a WhatsApp enquiry when the listing agent has a number', () => {
    renderWithSession(
      <PropertyCard property={{ ...mockProperty, agentPhone: '081234567890' }} />,
    )
    const link = screen.getByRole('link', { name: /whatsapp/i })
    expect(link).toHaveAttribute('href', expect.stringContaining('wa.me/6281234567890'))
    expect(link).toHaveAttribute('target', '_blank')
  })

  it('pre-fills the enquiry with the listing title and its URL', () => {
    renderWithSession(
      <PropertyCard property={{ ...mockProperty, agentPhone: '081234567890' }} />,
    )
    const href = screen.getByRole('link', { name: /whatsapp/i }).getAttribute('href')!
    const text = decodeURIComponent(new URL(href).searchParams.get('text')!)
    expect(text).toContain('Test Property')
    expect(text).toContain('/properti/1')
  })

  it('hides the WhatsApp button when no number is reachable', () => {
    renderWithSession(<PropertyCard property={mockProperty} />)
    expect(screen.queryByRole('link', { name: /whatsapp/i })).not.toBeInTheDocument()
  })
})
