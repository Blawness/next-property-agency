import { formatPriceCompact, formatPriceCompactValue, formatPriceFull } from '@/lib/constants'

describe('formatPriceCompact', () => {
  it('formats a billion-scale price with the M suffix', () => {
    expect(formatPriceCompact('1500000000', 'jual')).toBe('Rp 1,5 M')
  })
  it('formats a million-scale price with the Jt suffix', () => {
    expect(formatPriceCompact('750000000', 'jual')).toBe('Rp 750 Jt')
  })
  it('keeps a fractional million honest instead of rounding it whole', () => {
    expect(formatPriceCompact('3500000', 'jual')).toBe('Rp 3,5 Jt')
    expect(formatPriceCompact('1400000', 'jual')).toBe('Rp 1,4 Jt')
  })
  it('drops the decimal when the million is whole', () => {
    expect(formatPriceCompact('9000000', 'jual')).toBe('Rp 9 Jt')
  })
  it('formats a sub-million price with toLocaleString', () => {
    expect(formatPriceCompact('500000', 'jual')).toBe('Rp 500.000')
  })
  it('appends /bln for sewa listings', () => {
    expect(formatPriceCompact('500000000', 'sewa')).toBe('Rp 500 Jt/bln')
  })
  it('renders an em-dash for an empty string instead of "Rp NaN"', () => {
    expect(formatPriceCompact('', 'jual')).toBe('—')
  })
  it('renders an em-dash for a non-numeric string instead of "Rp NaN"', () => {
    expect(formatPriceCompact('abc', 'jual')).toBe('—')
  })
  it('renders an em-dash for whitespace-only input', () => {
    expect(formatPriceCompact('   ', 'jual')).toBe('—')
  })
})

describe('formatPriceCompactValue', () => {
  it('splits into prefix/value/suffix for a billion-scale price', () => {
    expect(formatPriceCompactValue('2500000000', 'jual')).toEqual({
      prefix: 'Rp',
      value: '2,5 M',
      suffix: '',
    })
  })
  it('appends /bln to the suffix for sewa listings', () => {
    expect(formatPriceCompactValue('500000000', 'sewa')).toEqual({
      prefix: 'Rp',
      value: '500 Jt',
      suffix: '/bln',
    })
  })
  it('returns an em-dash value for empty input', () => {
    expect(formatPriceCompactValue('', 'jual')).toEqual({
      prefix: 'Rp',
      value: '—',
      suffix: '',
    })
  })
  it('returns an em-dash value for non-numeric input', () => {
    expect(formatPriceCompactValue('not-a-number', 'jual')).toEqual({
      prefix: 'Rp',
      value: '—',
      suffix: '',
    })
  })
})

describe('formatPriceFull', () => {
  it('formats a billion-scale price in Miliar', () => {
    expect(formatPriceFull('1500000000', 'jual')).toBe('Rp 1,50 Miliar')
  })
  it('formats a million-scale price in Juta', () => {
    expect(formatPriceFull('750000000', 'jual')).toBe('Rp 750 Juta')
  })
  it('keeps a fractional million honest instead of rounding it whole', () => {
    // Rp 3.500.000 used to render as "Rp 4 Juta" — a 14% overstatement on
    // exactly the range monthly rents fall into.
    expect(formatPriceFull('3500000', 'sewa')).toBe('Rp 3,5 Juta/bulan')
    expect(formatPriceFull('1400000', 'jual')).toBe('Rp 1,4 Juta')
    expect(formatPriceFull('2500000', 'jual')).toBe('Rp 2,5 Juta')
  })
  it('drops the decimal when the million is whole', () => {
    expect(formatPriceFull('9000000', 'jual')).toBe('Rp 9 Juta')
  })
  it('writes billions with an Indonesian decimal comma', () => {
    expect(formatPriceFull('3200000000', 'jual')).toBe('Rp 3,20 Miliar')
  })
  it('appends /bulan for sewa listings', () => {
    expect(formatPriceFull('750000000', 'sewa')).toBe('Rp 750 Juta/bulan')
  })
  it('renders an em-dash for empty input', () => {
    expect(formatPriceFull('', 'jual')).toBe('—')
  })
  it('renders an em-dash for non-numeric input', () => {
    expect(formatPriceFull('not-a-number', 'jual')).toBe('—')
  })
})
