import { render, screen } from '@testing-library/react'
import BrandMark from '@/components/BrandMark'
import { BRAND } from '@/lib/brand'

describe('BrandMark', () => {
  it('renders both halves of the wordmark', () => {
    render(<BrandMark />)
    expect(screen.getByText(BRAND.wordmark.lead)).toBeInTheDocument()
    expect(screen.getByText(BRAND.wordmark.trail)).toBeInTheDocument()
  })

  it('renders an svg icon', () => {
    const { container } = render(<BrandMark />)
    expect(container.querySelector('svg')).toBeInTheDocument()
  })
})
