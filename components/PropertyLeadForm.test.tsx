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
    await userEvent.type(screen.getByLabelText(/email/i), 'budi@example.com')
    await userEvent.click(screen.getByRole('button', { name: /kirim pertanyaan/i }))

    await waitFor(() => expect(global.fetch).toHaveBeenCalled())

    const [url, init] = (global.fetch as jest.Mock).mock.calls[0]
    expect(url).toBe('/api/leads')
    expect(JSON.parse(init.body)).toMatchObject({
      name: 'Budi',
      email: 'budi@example.com',
      propertyId: 'p-1',
    })
  })
})
