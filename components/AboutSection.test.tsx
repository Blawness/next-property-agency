import { render, screen } from '@testing-library/react'
import AboutSection from '@/components/AboutSection'

describe('AboutSection', () => {
  it('renders heading, body, and 3 mockup-literal stats', () => {
    render(<AboutSection />)
    expect(screen.getByText('About Us')).toBeInTheDocument()
    expect(screen.getByText(/TAP Catalog is a federal network/)).toBeInTheDocument()
    expect(screen.getByText('20+')).toBeInTheDocument()
    expect(screen.getByText('served clients')).toBeInTheDocument()
    expect(screen.getByText('30')).toBeInTheDocument()
    expect(screen.getByText('our database')).toBeInTheDocument()
    expect(screen.getByText('99%')).toBeInTheDocument()
    expect(screen.getByText('quality property')).toBeInTheDocument()
  })
})
