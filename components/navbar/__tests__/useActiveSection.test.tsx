import { act, render } from "@testing-library/react"
import { useActiveSection } from "@/components/navbar/useActiveSection"

type Observed = { callback: IntersectionObserverCallback; targets: Element[]; disconnected: boolean }
let observers: Observed[] = []

beforeEach(() => {
  observers = []
  document.body.innerHTML = ""
  ;(globalThis as any).IntersectionObserver = jest.fn((callback: IntersectionObserverCallback) => {
    const o: Observed = { callback, targets: [], disconnected: false }
    observers.push(o)
    return {
      observe: (el: Element) => o.targets.push(el),
      disconnect: () => {
        o.disconnected = true
      },
      unobserve: jest.fn(),
    }
  })
})

function addSections() {
  for (const id of ["home", "contact"]) {
    const el = document.createElement("section")
    el.id = id
    document.body.appendChild(el)
  }
}

/** Reports `id` as the section in view to the newest live observer. */
function see(id: string) {
  const o = observers.filter((x) => !x.disconnected).at(-1)!
  const target = document.getElementById(id)!
  act(() => {
    o.callback(
      [{ isIntersecting: true, intersectionRatio: 1, target } as unknown as IntersectionObserverEntry],
      {} as IntersectionObserver,
    )
  })
}

function Probe({ pathname }: { pathname: string }) {
  return <output>{useActiveSection(pathname) ?? "none"}</output>
}

describe("useActiveSection", () => {
  it("follows the homepage section in view", () => {
    addSections()
    const { container } = render(<Probe pathname="/" />)
    see("contact")
    expect(container.textContent).toBe("contact")
  })

  it("forgets the section after a client-side visit elsewhere and back", () => {
    addSections()
    const { container, rerender } = render(<Probe pathname="/" />)
    see("contact")
    rerender(<Probe pathname="/properti" />)
    expect(container.textContent).toBe("none")
    rerender(<Probe pathname="/" />)
    expect(container.textContent).toBe("none")
  })

  it("starts observing when the homepage is reached by client-side navigation", () => {
    const { container, rerender } = render(<Probe pathname="/properti" />)
    expect(observers).toHaveLength(0)
    addSections()
    rerender(<Probe pathname="/" />)
    see("contact")
    expect(container.textContent).toBe("contact")
  })

  it("waits for sections that stream in after mount", () => {
    jest.useFakeTimers()
    try {
      const { container } = render(<Probe pathname="/" />)
      expect(observers).toHaveLength(0)
      addSections()
      act(() => {
        jest.advanceTimersByTime(100)
      })
      see("contact")
      expect(container.textContent).toBe("contact")
    } finally {
      jest.useRealTimers()
    }
  })
})
