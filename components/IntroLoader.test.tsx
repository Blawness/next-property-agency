import { act, render, screen } from '@testing-library/react'
import IntroLoader, {
  INTRO_DONE_EVENT,
  INTRO_MAX_MS,
  INTRO_MIN_MS,
  INTRO_PREPARE_EVENT,
  INTRO_SEEN_KEY,
} from '@/components/IntroLoader'
import { BRAND } from '@/lib/brand'

const root = document.documentElement

function setReadyState(state: DocumentReadyState) {
  Object.defineProperty(document, 'readyState', { value: state, configurable: true })
}

/** Advance fake time synchronously; each act() also lets React run effects. */
function advance(ms: number) {
  act(() => {
    jest.advanceTimersByTime(ms)
  })
}

/** Let pending promises (the decode stage) resolve. */
async function flush() {
  await act(async () => {})
}

describe('IntroLoader', () => {
  beforeEach(() => {
    jest.useFakeTimers()
    sessionStorage.clear()
    root.className = ''
    setReadyState('complete')
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('holds the page until it has loaded and settled, lifts, then releases scrolling', async () => {
    const prepared = jest.fn()
    const done = jest.fn()
    window.addEventListener(INTRO_PREPARE_EVENT, prepared)
    window.addEventListener(INTRO_DONE_EVENT, done)
    render(<IntroLoader />)

    expect(screen.getByText(BRAND.logo.wordmark)).toBeInTheDocument()
    expect(root).toHaveClass('intro-active')

    // Loaded: photographs are decoded and the page is prepared behind the curtain.
    advance(50)
    await flush()
    expect(prepared).toHaveBeenCalledTimes(1)

    // Settled, but not before the minimum.
    advance(INTRO_MIN_MS / 2)
    expect(root).not.toHaveClass('intro-lifting')

    // Lifting: the hero's entrance may play, but scrolling is still held.
    advance(INTRO_MIN_MS)
    expect(root).toHaveClass('intro-lifting')
    expect(root).toHaveClass('intro-active')
    expect(done).not.toHaveBeenCalled()

    // Gone: scrolling released.
    advance(1100)
    expect(done).toHaveBeenCalledTimes(1)
    expect(root).not.toHaveClass('intro-lifting')
    expect(root).not.toHaveClass('intro-active')
    expect(root).toHaveClass('intro-done')
    expect(sessionStorage.getItem(INTRO_SEEN_KEY)).toBe('1')
    window.removeEventListener(INTRO_PREPARE_EVENT, prepared)
    window.removeEventListener(INTRO_DONE_EVENT, done)
  })

  it('never holds a visitor past the maximum, even if the page never finishes loading', () => {
    setReadyState('loading')
    const done = jest.fn()
    window.addEventListener(INTRO_DONE_EVENT, done)
    render(<IntroLoader />)

    advance(INTRO_MAX_MS - 500)
    expect(root).not.toHaveClass('intro-lifting')

    advance(600)
    expect(root).toHaveClass('intro-lifting')

    advance(1100)
    expect(done).toHaveBeenCalledTimes(1)
    window.removeEventListener(INTRO_DONE_EVENT, done)
  })

  it('does not play again on a return to the homepage in the same session', () => {
    sessionStorage.setItem(INTRO_SEEN_KEY, '1')
    const done = jest.fn()
    window.addEventListener(INTRO_DONE_EVENT, done)
    const { container } = render(<IntroLoader />)

    expect(container).toBeEmptyDOMElement()
    expect(root).toHaveClass('intro-done')
    expect(root).not.toHaveClass('intro-active')
    expect(done).toHaveBeenCalledTimes(1)
    window.removeEventListener(INTRO_DONE_EVENT, done)
  })
})
