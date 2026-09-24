import { renderHook, act } from '@testing-library/react'
import { useOverHero } from '@/components/navbar/useOverHero'

function setScroll(y: number) {
  Object.defineProperty(window, 'scrollY', { value: y, configurable: true })
}

afterEach(() => {
  document.body.innerHTML = ''
  setScroll(0)
})

describe('useOverHero', () => {
  it('is never over the hero off the homepage', () => {
    const { result } = renderHook(() => useOverHero('/properti'))
    expect(result.current).toBe(false)
  })

  it('stays transparent at the top while the streamed hero has not mounted yet', () => {
    // The homepage streams behind app/loading.tsx, so #home can be missing on
    // the first check. It used to read that as "scrolled past" and stick.
    Object.defineProperty(window, 'innerHeight', { value: 900, configurable: true })
    const { result } = renderHook(() => useOverHero('/'))
    expect(result.current).toBe(true)
  })

  it('turns solid once the hero has scrolled out from under the bar', () => {
    const hero = document.createElement('section')
    hero.id = 'home'
    document.body.appendChild(hero)
    let bottom = 900
    hero.getBoundingClientRect = () => ({ bottom }) as DOMRect

    const { result } = renderHook(() => useOverHero('/'))
    expect(result.current).toBe(true)

    act(() => {
      bottom = 40
      window.dispatchEvent(new Event('scroll'))
    })
    expect(result.current).toBe(false)
  })
})
