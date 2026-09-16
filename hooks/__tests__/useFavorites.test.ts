jest.mock('next-auth/react', () => ({
  useSession: jest.fn(),
}))

import { renderHook, waitFor } from '@testing-library/react'
import { useFavorites } from '@/hooks/useFavorites'
import { useSession } from 'next-auth/react'

const mockUseSession = useSession as jest.Mock

describe('useFavorites', () => {
  beforeEach(() => {
    jest.restoreAllMocks()
    mockUseSession.mockReset()
    globalThis.fetch = jest.fn() as any
  })

  it('returns empty favorites and loading when no session', async () => {
    mockUseSession.mockReturnValue({ data: null })
    const { result } = renderHook(() => useFavorites())
    expect(result.current.favorites).toEqual([])
    expect(result.current.loadingFavs).toBe(true)
    expect(result.current.error).toBe('')
  })

  it('fetches favorites when session exists', async () => {
    const fav = { id: 'p1', title: 'Test', images: [] }
    ;(globalThis.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ favorites: [fav] }),
    })
    mockUseSession.mockReturnValue({ data: { user: { id: 'u1' } } })

    const { result } = renderHook(() => useFavorites())
    await waitFor(() => expect(result.current.loadingFavs).toBe(false))
    expect(result.current.favorites).toEqual([fav])
    expect(result.current.error).toBe('')
  })

  it('sets error on fetch failure', async () => {
    ;(globalThis.fetch as jest.Mock).mockResolvedValue({ ok: false, json: async () => ({}) })
    mockUseSession.mockReturnValue({ data: { user: { id: 'u1' } } })

    const { result } = renderHook(() => useFavorites())
    await waitFor(() => expect(result.current.loadingFavs).toBe(false))
    expect(result.current.error).toBe('Failed to fetch favorites')
    expect(result.current.favorites).toEqual([])
  })
})
