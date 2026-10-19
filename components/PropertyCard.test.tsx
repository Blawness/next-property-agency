import { render, screen } from '@testing-library/react'
import { SessionProvider } from 'next-auth/react'
import PropertyCard, { specLine } from '@/components/PropertyCard'
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

describe('PropertyCard layout', () => {
  it('reads type label, then title, location, specs and price', () => {
    const { container } = renderWithSession(
      <PropertyCard property={{ ...mockProperty, address: 'Jl. Melati 5, Kemang' }} />,
    )
    const text = container.textContent ?? ''
    const order = ['Rumah', 'Test Property', 'Jl. Melati 5, Kemang', '3 KT · 2 KM · 100 m²', '1 M'].map(
      (s) => text.indexOf(s),
    )
    expect(order.every((i) => i >= 0)).toBe(true)
    expect([...order].sort((a, b) => a - b)).toEqual(order)
  })

  it('falls back to the city when there is no address', () => {
    renderWithSession(<PropertyCard property={mockProperty} />)
    expect(screen.getByText('Jakarta')).toBeInTheDocument()
  })

  it('marks a rent price per month in full', () => {
    renderWithSession(
      <PropertyCard property={{ ...mockProperty, listingType: 'sewa', price: '15000000' }} />,
    )
    expect(screen.getByText('/bulan')).toBeInTheDocument()
  })

  it('is flat: no border or shadow around the card', () => {
    const { container } = renderWithSession(<PropertyCard property={mockProperty} />)
    const card = container.firstChild as HTMLElement
    expect(card.className).not.toMatch(/\bborder\b|shadow/)
  })

  it('sets the price in the text colour, not the call-to-action colour', () => {
    renderWithSession(<PropertyCard property={mockProperty} />)
    const price = screen.getByText('1 M').parentElement!
    expect(price.className).toContain('text-foreground')
    expect(price.className).not.toContain('text-primary')
  })

  it('shows a placeholder instead of a broken image when there is no photo', () => {
    const { container } = renderWithSession(<PropertyCard property={{ ...mockProperty, images: [] }} />)
    expect(screen.getByText('Tidak ada foto')).toBeInTheDocument()
    expect(container.querySelector('img')).toBeNull()
  })

  it('gives the rail variant a fixed width so the rail can scroll', () => {
    const { container } = renderWithSession(<PropertyCard property={mockProperty} variant="rail" />)
    expect((container.firstChild as HTMLElement).className).toContain('w-[260px]')
  })
})

describe('PropertyCard spec icon', () => {
  it('shows a bed for a listing with bedrooms', () => {
    const { container } = renderWithSession(<PropertyCard property={mockProperty} />)
    expect(container.querySelector('.lucide-bed-double')).not.toBeNull()
  })

  it('shows an area icon, not a bed, for land', () => {
    const { container } = renderWithSession(<PropertyCard property={{ ...mockProperty, type: 'tanah' }} />)
    expect(container.querySelector('.lucide-bed-double')).toBeNull()
    expect(container.querySelector('.lucide-maximize-2')).not.toBeNull()
  })

  it('shows an area icon when a building lists no bedrooms', () => {
    const { container } = renderWithSession(
      <PropertyCard property={{ ...mockProperty, type: 'ruko', bedrooms: null, bathrooms: null }} />,
    )
    expect(container.querySelector('.lucide-bed-double')).toBeNull()
    expect(container.querySelector('.lucide-maximize-2')).not.toBeNull()
  })
})

describe('specLine', () => {
  it('joins rooms and building area', () => {
    expect(specLine(mockProperty)).toBe('3 KT · 2 KM · 100 m²')
  })

  it('shows land area alone for tanah', () => {
    expect(specLine({ ...mockProperty, type: 'tanah' })).toBe('LT 200 m²')
  })

  it('is null for tanah without a land area, so no empty row renders', () => {
    expect(specLine({ ...mockProperty, type: 'tanah', landArea: null })).toBeNull()
  })

  it('is null when a building has no specs at all', () => {
    expect(
      specLine({ ...mockProperty, bedrooms: null, bathrooms: null, buildingArea: null }),
    ).toBeNull()
  })

  it('skips only the missing parts', () => {
    expect(specLine({ ...mockProperty, bathrooms: null })).toBe('3 KT · 100 m²')
  })
})
