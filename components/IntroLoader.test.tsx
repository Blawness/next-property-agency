import { act, render, screen } from '@testing-library/react'
import IntroLoader, {
  INTRO_DONE_EVENT,
  INTRO_MAX_MS,
  INTRO_MIN_MS,
  INTRO_SEEN_KEY,
} from '@/components/IntroLoader'
import { BRAND } from '@/lib/brand'

const root = document.documentElement

function setReadyState(state: DocumentReadyState) {
  Object.defineProperty(document, 'readyState', { value: state, configurable: true })
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

  it('holds the page, then lifts once loaded and the minimum time has passed', () => {
    const done = jest.fn()
    window.addEventListener(INTRO_DONE_EVENT, done)
    render(<IntroLoader />)

    expect(screen.getByText(BRAND.logo.wordmark)).toBeInTheDocument()
    expect(root).toHaveClass('intro-active')

    act(() => {
      jest.advanceTimersByTime(INTRO_MIN_MS / 2)
    })
    expect(done).not.toHaveBeenCalled()

    act(() => {
      jest.advanceTimersByTime(INTRO_MIN_MS)
    })
    expect(done).toHaveBeenCalledTimes(1)
    expect(root).toHaveClass('intro-done')
    expect(root).not.toHaveClass('intro-active')
    expect(sessionStorage.getItem(INTRO_SEEN_KEY)).toBe('1')
    window.removeEventListener(INTRO_DONE_EVENT, done)
  })

  it('never holds a visitor past the maximum, even if the page never finishes loading', () => {
    setReadyState('loading')
    const done = jest.fn()
    window.addEventListener(INTRO_DONE_EVENT, done)
    render(<IntroLoader />)

    act(() => {
      jest.advanceTimersByTime(INTRO_MAX_MS - 500)
    })
    expect(done).not.toHaveBeenCalled()

    act(() => {
      jest.advanceTimersByTime(1000)
    })
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
