import { render, screen } from '@testing-library/react'
import BrandMark from '@/components/BrandMark'
import { BRAND } from '@/lib/brand'

describe('BrandMark', () => {
  it('exposes the brand name as the logo image', () => {
    render(<BrandMark />)
    expect(screen.getByRole('img', { name: BRAND.name })).toBeInTheDocument()
  })

  it('switches to the light artwork when inverted', () => {
    render(<BrandMark inverted />)
    expect(screen.getByRole('img', { name: BRAND.name })).toHaveClass('text-primary-foreground')
  })
})
