import { act, render } from "@testing-library/react"
import { useOverHero } from "@/components/navbar/useOverHero"

function Probe({ pathname }: { pathname: string }) {
  return <output>{String(useOverHero(pathname))}</output>
}

function hero(bottom: number) {
  document.body.innerHTML = ""
  const el = document.createElement("section")
  el.id = "home"
  el.getBoundingClientRect = () => ({ bottom } as DOMRect)
  document.body.appendChild(el)
  return el
}

describe("useOverHero", () => {
  it("is true on the homepage while the hero is under the bar", () => {
    hero(600)
    const { container } = render(<Probe pathname="/" />)
    expect(container.textContent).toBe("true")
  })

  it("turns false once the hero has scrolled past the bar", () => {
    const el = hero(600)
    const { container } = render(<Probe pathname="/" />)
    el.getBoundingClientRect = () => ({ bottom: 40 } as DOMRect)
    act(() => {
      window.dispatchEvent(new Event("scroll"))
    })
    expect(container.textContent).toBe("false")
  })

  it("is false on every other page", () => {
    hero(600)
    const { container } = render(<Probe pathname="/properti" />)
    expect(container.textContent).toBe("false")
  })

  it("re-measures after client-side navigation back to the homepage", () => {
    const el = hero(600)
    const { container, rerender } = render(<Probe pathname="/" />)
    el.getBoundingClientRect = () => ({ bottom: 40 } as DOMRect)
    act(() => {
      window.dispatchEvent(new Event("scroll"))
    })
    rerender(<Probe pathname="/properti" />)
    el.getBoundingClientRect = () => ({ bottom: 600 } as DOMRect)
    rerender(<Probe pathname="/" />)
    expect(container.textContent).toBe("true")
  })
})
