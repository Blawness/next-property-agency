import { render, screen } from '@testing-library/react'
import HeroSection from '@/components/HeroSection'

jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: { alt?: string; src: string }) => {
    // eslint-disable-next-line @next/next/no-img-element
    return <img alt={props.alt ?? ''} src={props.src} />
  },
}))

beforeAll(() => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    }),
  })
})

describe('HeroSection', () => {
  it('renders both headline lines', () => {
    render(<HeroSection />)
    expect(screen.getByText('Discover Your Mission')).toBeInTheDocument()
    expect(screen.getByText('Build Our Passion')).toBeInTheDocument()
  })

  it('renders Book now and For seller CTAs', () => {
    render(<HeroSection />)
    expect(screen.getByText('Book now')).toBeInTheDocument()
    expect(screen.getByText('For seller')).toBeInTheDocument()
  })

  it('links Book now to /properti (browse listings)', () => {
    render(<HeroSection />)
    const bookNow = screen.getByText('Book now').closest('a')
    expect(bookNow).toHaveAttribute('href', '/properti')
  })

  it('links For seller to #contact', () => {
    render(<HeroSection />)
    const forSeller = screen.getByText('For seller').closest('a')
    expect(forSeller).toHaveAttribute('href', '#contact')
  })

  it('renders a video element with autoplay/loop/muted/playsInline', () => {
    render(<HeroSection />)
    const video = document.querySelector('video')
    expect(video).toBeInTheDocument()
    expect(video).toHaveAttribute('autoplay')
    expect(video).toHaveAttribute('loop')
    expect(video).toHaveAttribute('playsinline')
    expect((video as HTMLVideoElement | null)?.muted).toBe(true)
  })

  it('exposes AV1 (mp4) primary and VP9 (webm) fallback sources', () => {
    render(<HeroSection />)
    const sources = document.querySelectorAll('video source')
    expect(sources).toHaveLength(2)
    expect(sources[0]).toHaveAttribute('src', '/hero.av1.mp4')
    expect(sources[0]).toHaveAttribute('type', 'video/mp4; codecs="av01.0.05M.08"')
    expect(sources[1]).toHaveAttribute('src', '/hero.webm')
    expect(sources[1]).toHaveAttribute('type', 'video/webm; codecs="vp9"')
  })
})
