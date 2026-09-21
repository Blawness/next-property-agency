import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import PropertyLeadForm from '@/components/PropertyLeadForm'

jest.mock('sonner', () => ({
  toast: { success: jest.fn(), error: jest.fn() },
}))

describe('PropertyLeadForm', () => {
  beforeEach(() => {
    global.fetch = jest.fn().mockResolvedValue({ ok: true, json: async () => ({ ok: true }) }) as jest.Mock
  })

  it('prefills the message with the property title', () => {
    render(<PropertyLeadForm propertyId="p-1" propertyTitle="Rumah Bintaro" />)
    expect(screen.getByLabelText(/pesan/i)).toHaveValue(
      'Halo, saya tertarik dengan "Rumah Bintaro". Bisa info lebih lanjut?',
    )
  })

  it('submits the lead with the property id attached', async () => {
    render(<PropertyLeadForm propertyId="p-1" propertyTitle="Rumah Bintaro" />)

    await userEvent.type(screen.getByLabelText(/nama/i), 'Budi')
    await userEvent.type(screen.getByLabelText(/whatsapp/i), '081234567890')
    await userEvent.type(screen.getByLabelText(/email/i), 'budi@example.com')
    await userEvent.click(screen.getByRole('button', { name: /kirim pertanyaan/i }))

    await waitFor(() => expect(global.fetch).toHaveBeenCalled())

    const [url, init] = (global.fetch as jest.Mock).mock.calls[0]
    expect(url).toBe('/api/leads')
    expect(JSON.parse(init.body)).toMatchObject({
      name: 'Budi',
      phone: '081234567890',
      email: 'budi@example.com',
      propertyId: 'p-1',
    })
  })

  it('asks for a phone number and marks it required', () => {
    render(<PropertyLeadForm propertyId="p-1" propertyTitle="Rumah Bintaro" />)
    expect(screen.getByLabelText(/whatsapp/i)).toBeRequired()
  })

  it('leaves email optional, and says so', () => {
    render(<PropertyLeadForm propertyId="p-1" propertyTitle="Rumah Bintaro" />)
    const email = screen.getByLabelText(/email/i)
    expect(email).not.toBeRequired()
    expect(screen.getByText(/email.*opsional/i)).toBeInTheDocument()
  })

  it('submits without an email', async () => {
    render(<PropertyLeadForm propertyId="p-1" propertyTitle="Rumah Bintaro" />)

    await userEvent.type(screen.getByLabelText(/nama/i), 'Budi')
    await userEvent.type(screen.getByLabelText(/whatsapp/i), '081234567890')
    await userEvent.click(screen.getByRole('button', { name: /kirim pertanyaan/i }))

    await waitFor(() => expect(global.fetch).toHaveBeenCalled())
    expect(JSON.parse((global.fetch as jest.Mock).mock.calls[0][1].body)).toMatchObject({
      phone: '081234567890',
      email: '',
    })
  })
})
