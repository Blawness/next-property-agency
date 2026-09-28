import { render, screen } from '@testing-library/react'
import BrandMark from '@/components/BrandMark'
import { BRAND } from '@/lib/brand'

describe('BrandMark', () => {
  it('renders the wordmark', () => {
    render(<BrandMark />)
    expect(screen.getByText(BRAND.logo.wordmark)).toBeInTheDocument()
  })

  it('keeps the monogram out of the accessible name', () => {
    render(<BrandMark />)
    expect(screen.getByText(BRAND.logo.monogram)).toHaveAttribute('aria-hidden')
  })
})
