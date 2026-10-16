import { render } from "@testing-library/react"
import HashScroll from "@/components/home/HashScroll"

const scrollIntoView = jest.fn()

beforeEach(() => {
  scrollIntoView.mockClear()
  Element.prototype.scrollIntoView = scrollIntoView
  document.body.innerHTML = ""
})

afterEach(() => {
  window.history.replaceState(null, "", "/")
})

function section(id: string) {
  const el = document.createElement("section")
  el.id = id
  document.body.appendChild(el)
  return el
}

describe("HashScroll", () => {
  it("scrolls to the section named in the URL once the streamed page is in", () => {
    const contact = section("contact")
    window.history.replaceState(null, "", "/#contact")
    render(<HashScroll />)
    expect(scrollIntoView).toHaveBeenCalledTimes(1)
    expect(scrollIntoView.mock.instances[0]).toBe(contact)
  })

  it("does nothing without a hash", () => {
    section("contact")
    render(<HashScroll />)
    expect(scrollIntoView).not.toHaveBeenCalled()
  })

  it("ignores a hash that names no element", () => {
    window.history.replaceState(null, "", "/#about")
    render(<HashScroll />)
    expect(scrollIntoView).not.toHaveBeenCalled()
  })
})
