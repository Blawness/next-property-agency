import { render, screen } from '@testing-library/react'
import ContactSection from '@/components/ContactSection'

jest.mock('sonner', () => ({
  toast: { success: jest.fn(), error: jest.fn() },
}))

describe('ContactSection', () => {
  it('renders Contact word, italic subtitle, and 3-form fields', () => {
    render(<ContactSection />)
    expect(screen.getByText('Contact')).toBeInTheDocument()
    expect(screen.getByText(/Tell us what you are looking for/)).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Full name')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Work email')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('What are you looking for?')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /send request/i })).toBeInTheDocument()
  })
})
