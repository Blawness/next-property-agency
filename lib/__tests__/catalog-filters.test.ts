import { escapeLikePattern, parseMinBedrooms, isSortKey } from '@/lib/constants'

describe('escapeLikePattern', () => {
  it('leaves ordinary search terms untouched', () => {
    expect(escapeLikePattern('Rumah Bintaro')).toBe('Rumah Bintaro')
  })

  it('escapes LIKE wildcards so they narrow instead of widening the match', () => {
    expect(escapeLikePattern('%')).toBe('\\%')
    expect(escapeLikePattern('_')).toBe('\\_')
    expect(escapeLikePattern('50%_off')).toBe('50\\%\\_off')
  })

  it('escapes the escape character itself', () => {
    expect(escapeLikePattern('a\\b')).toBe('a\\\\b')
  })
})

describe('parseMinBedrooms', () => {
  it('parses positive integers', () => {
    expect(parseMinBedrooms('3')).toBe(3)
  })

  it('treats missing, empty, and non-numeric input as no filter', () => {
    expect(parseMinBedrooms(undefined)).toBeNull()
    expect(parseMinBedrooms('')).toBeNull()
    expect(parseMinBedrooms('semua')).toBeNull()
  })

  it('rejects zero and negative values', () => {
    expect(parseMinBedrooms('0')).toBeNull()
    expect(parseMinBedrooms('-2')).toBeNull()
  })
})

describe('isSortKey', () => {
  it('accepts the supported sort keys', () => {
    expect(isSortKey('terbaru')).toBe(true)
    expect(isSortKey('termurah')).toBe(true)
    expect(isSortKey('termahal')).toBe(true)
  })

  it('rejects unknown or missing keys so the default ordering wins', () => {
    expect(isSortKey(undefined)).toBe(false)
    expect(isSortKey('acak')).toBe(false)
  })
})
