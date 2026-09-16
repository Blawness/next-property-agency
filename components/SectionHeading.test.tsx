import { render, screen } from '@testing-library/react'
import SectionHeading from '@/components/SectionHeading'

describe('SectionHeading', () => {
  it('renders eyebrow, title and subtitle', () => {
    render(<SectionHeading eyebrow="Kategori" title="Judul Section" subtitle="Subjudul di sini" />)
    expect(screen.getByText('Kategori')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Judul Section' })).toBeInTheDocument()
    expect(screen.getByText('Subjudul di sini')).toBeInTheDocument()
  })

  it('renders title only when eyebrow/subtitle omitted', () => {
    render(<SectionHeading title="Hanya Judul" />)
    expect(screen.getByRole('heading', { name: 'Hanya Judul' })).toBeInTheDocument()
  })

  it('centers by default', () => {
    const { container } = render(<SectionHeading title="A" />)
    expect(container.firstChild).toHaveClass('text-center')
  })

  it('can align left', () => {
    const { container } = render(<SectionHeading title="A" align="left" />)
    expect(container.firstChild).toHaveClass('text-left')
  })
})
