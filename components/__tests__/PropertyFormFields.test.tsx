import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import PropertyFormFields from '@/components/PropertyFormFields'

const baseFields = {
  title: '', description: '', price: '', type: 'rumah', listingType: 'jual',
  city: '', address: '', lat: '', lng: '',
  landArea: '', buildingArea: '', bedrooms: '', bathrooms: '',
}

describe('PropertyFormFields', () => {
  it('renders core inputs with current values', () => {
    render(<PropertyFormFields fields={{ ...baseFields, title: 'Rumah A', city: 'Jakarta' }} setField={jest.fn()} />)
    expect(screen.getByLabelText(/judul iklan/i)).toHaveValue('Rumah A')
    expect(screen.getByLabelText(/kota/i)).toHaveValue('Jakarta')
    expect(screen.getByLabelText(/harga/i)).toBeInTheDocument()
  })

  it('calls setField with key and value when typing in title', async () => {
    const setField = jest.fn()
    render(<PropertyFormFields fields={baseFields} setField={setField} />)
    await userEvent.type(screen.getByLabelText(/judul iklan/i), 'Rumah')
    expect(setField).toHaveBeenCalledWith('title', 'R')
    expect(setField).toHaveBeenCalledWith('title', 'u')
  })

  it('shows bedroom/bathroom fields for rumah (non-tanah)', () => {
    render(<PropertyFormFields fields={baseFields} setField={jest.fn()} />)
    expect(screen.getByLabelText(/kamar tidur/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/kamar mandi/i)).toBeInTheDocument()
  })

  it('hides bedroom/bathroom fields for tanah', () => {
    render(<PropertyFormFields fields={{ ...baseFields, type: 'tanah' }} setField={jest.fn()} />)
    expect(screen.queryByLabelText(/kamar tidur/i)).not.toBeInTheDocument()
    expect(screen.queryByLabelText(/kamar mandi/i)).not.toBeInTheDocument()
  })

  it('renders latitude and longitude inputs as optional', () => {
    render(<PropertyFormFields fields={baseFields} setField={jest.fn()} />)
    expect(screen.getByLabelText(/latitude/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/longitude/i)).toBeInTheDocument()
  })
})
