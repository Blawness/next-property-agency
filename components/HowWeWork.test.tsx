import { render, screen } from '@testing-library/react'
import HowWeWork from '@/components/HowWeWork'
import { BRAND } from '@/lib/brand'

describe('HowWeWork', () => {
  it('renders the heading and every step from the brand config', () => {
    render(<HowWeWork />)
    expect(screen.getByRole('heading', { level: 2, name: BRAND.howWeWork.heading })).toBeInTheDocument()
    for (const step of BRAND.howWeWork.steps) {
      expect(screen.getByRole('heading', { level: 3, name: step.title })).toBeInTheDocument()
    }
  })

  it('numbers the steps in order', () => {
    render(<HowWeWork />)
    expect(screen.getAllByRole('listitem')).toHaveLength(BRAND.howWeWork.steps.length)
    expect(screen.getByText('01')).toBeInTheDocument()
    expect(screen.getByText('04')).toBeInTheDocument()
  })
})
