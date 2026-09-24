import { render, screen } from '@testing-library/react'
import AboutSection from '@/components/AboutSection'
import { BRAND } from '@/lib/brand'

describe('AboutSection', () => {
  it('renders the brand heading, statement and body', () => {
    render(<AboutSection />)
    expect(screen.getByText(BRAND.about.heading)).toBeInTheDocument()
    expect(screen.getByText(BRAND.about.statement)).toBeInTheDocument()
    expect(screen.getByText(BRAND.about.body)).toBeInTheDocument()
  })

  // Counting listings, cities and agents only flatters an agency with
  // thousands of them; at this size the numbers worked against the brand.
  it('shows no stats band', () => {
    const { container } = render(<AboutSection />)
    expect(container.querySelector('dl')).toBeNull()
  })
})
