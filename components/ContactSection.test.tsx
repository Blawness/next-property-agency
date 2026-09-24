import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import ContactSection from '@/components/ContactSection'
import { BRAND } from '@/lib/brand'

jest.mock('sonner', () => ({
  toast: { success: jest.fn(), error: jest.fn() },
}))

describe('ContactSection', () => {
  it('renders the heading and every field the lead API needs', () => {
    render(<ContactSection />)
    expect(screen.getByRole('heading', { name: BRAND.contactSection.heading })).toBeInTheDocument()
    expect(screen.getByLabelText('Nama lengkap')).toBeRequired()
    expect(screen.getByLabelText('Nomor WhatsApp')).toBeRequired()
    expect(screen.getByLabelText('Email (opsional)')).not.toBeRequired()
    expect(screen.getByLabelText('Properti yang Anda cari')).toHaveAttribute('minlength', '10')
    expect(screen.getByRole('button', { name: /kirim permintaan/i })).toBeInTheDocument()
  })

  it('posts phone along with the rest, since /api/leads rejects a lead without one', async () => {
    const fetchMock = jest.fn().mockResolvedValue({ ok: true, json: async () => ({}) })
    ;(globalThis as { fetch: unknown }).fetch = fetchMock

    render(<ContactSection />)
    fireEvent.change(screen.getByLabelText('Nama lengkap'), { target: { value: 'Budi' } })
    fireEvent.change(screen.getByLabelText('Nomor WhatsApp'), { target: { value: '081234567890' } })
    fireEvent.change(screen.getByLabelText('Properti yang Anda cari'), {
      target: { value: 'Rumah 3 kamar di Bandung' },
    })
    fireEvent.submit(screen.getByRole('button', { name: /kirim permintaan/i }).closest('form')!)

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1))
    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toBe('/api/leads')
    expect(JSON.parse(init.body)).toEqual({
      name: 'Budi',
      phone: '081234567890',
      email: '',
      message: 'Rumah 3 kamar di Bandung',
    })
  })
})
