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

  it('formats price correctly', () => {
    renderWithSession(<PropertyCard property={mockProperty} />)
    expect(screen.getByText(/1\.0 M/)).toBeInTheDocument()
    expect(screen.getByText('Rp')).toBeInTheDocument()
  })
})