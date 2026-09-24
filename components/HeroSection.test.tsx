import { render, screen } from '@testing-library/react'
import HeroSection from '@/components/HeroSection'
import { BRAND } from '@/lib/brand'

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
  it('renders both headline lines from the brand config', () => {
    render(<HeroSection />)
    expect(screen.getByText(BRAND.hero.headline.lead)).toBeInTheDocument()
    expect(screen.getByText(BRAND.hero.headline.trail)).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
  })

  it('links the primary CTA to the catalog', () => {
    render(<HeroSection />)
    const primary = screen.getByText(BRAND.hero.primaryCta).closest('a')
    expect(primary).toHaveAttribute('href', '/properti')
  })

  it('links the consultation CTA to #contact', () => {
    render(<HeroSection />)
    const secondary = screen.getByText(BRAND.hero.secondaryCta).closest('a')
    expect(secondary).toHaveAttribute('href', '#contact')
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
