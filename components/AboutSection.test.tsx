import { render, screen } from '@testing-library/react'
import AboutSection from '@/components/AboutSection'
import { BRAND } from '@/lib/brand'

describe('AboutSection', () => {
  it('renders the brand heading, body, and every brand stat', () => {
    render(<AboutSection />)
    expect(screen.getByText(BRAND.about.heading)).toBeInTheDocument()
    expect(screen.getByText(BRAND.about.body)).toBeInTheDocument()
    for (const stat of BRAND.stats) {
      expect(screen.getByText(stat.n)).toBeInTheDocument()
      expect(screen.getByText(stat.label)).toBeInTheDocument()
    }
  })
})
