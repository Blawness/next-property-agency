import { render, screen } from '@testing-library/react'
import BrandMark from '@/components/BrandMark'

describe('BrandMark', () => {
  it('renders TAP and CATALOG text', () => {
    render(<BrandMark />)
    expect(screen.getByText('TAP')).toBeInTheDocument()
    expect(screen.getByText('CATALOG')).toBeInTheDocument()
  })

  it('renders an svg icon', () => {
    const { container } = render(<BrandMark />)
    expect(container.querySelector('svg')).toBeInTheDocument()
  })
})
