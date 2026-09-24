import { render, screen, act } from '@testing-library/react'
import Reveal from '@/components/Reveal'

let ioCallback: IntersectionObserverCallback

beforeEach(() => {
  ;(globalThis as any).IntersectionObserver = jest.fn((cb: IntersectionObserverCallback) => {
    ioCallback = cb
    return { observe: jest.fn(), disconnect: jest.fn(), unobserve: jest.fn() }
  })
})

describe('Reveal', () => {
  it('renders children', () => {
    render(<Reveal>Hello content</Reveal>)
    expect(screen.getByText('Hello content')).toBeInTheDocument()
  })

  it('starts hidden and becomes visible on intersection', () => {
    const { container } = render(<Reveal>Hi</Reveal>)
    const el = container.firstChild as HTMLElement
    expect(el.className).toContain('opacity-0')
    act(() => {
      ioCallback([{ isIntersecting: true } as IntersectionObserverEntry], {} as IntersectionObserver)
    })
    expect(el.className).toContain('opacity-100')
  })

  it('applies transition delay', () => {
    const { container } = render(<Reveal delay={150}>Hi</Reveal>)
    const el = container.firstChild as HTMLElement
    expect(el.style.transitionDelay).toBe('150ms')
  })

  it('observes an unclipped wrapper for unveil, so the clip cannot hide it from the observer', () => {
    const { container } = render(<Reveal effect="unveil">Photo</Reveal>)
    const outer = container.firstChild as HTMLElement
    const inner = outer.firstChild as HTMLElement
    expect(outer.className).not.toContain('clip-path')
    expect(inner.className).toContain('clip-path:inset(100%')
    act(() => {
      ioCallback([{ isIntersecting: true } as IntersectionObserverEntry], {} as IntersectionObserver)
    })
    expect(inner.className).toContain('clip-path:inset(0')
  })
})
