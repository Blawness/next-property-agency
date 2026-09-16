import { render, screen } from '@testing-library/react'
import HowWeWork from '@/components/HowWeWork'

describe('HowWeWork', () => {
  it('renders heading and 4 mockup-literal step titles', () => {
    render(<HowWeWork />)
    expect(screen.getByText('How We Work')).toBeInTheDocument()
    expect(screen.getByText('Free Consultation')).toBeInTheDocument()
    expect(screen.getByText('Search & Selection')).toBeInTheDocument()
    expect(screen.getByText('Data Verification')).toBeInTheDocument()
    expect(screen.getByText('Finishing')).toBeInTheDocument()
  })

  it('renders 4 svg icons', () => {
    const { container } = render(<HowWeWork />)
    expect(container.querySelectorAll('svg').length).toBeGreaterThanOrEqual(4)
  })
})
