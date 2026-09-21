import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import ShareButton from "@/components/ShareButton"
import { toast } from "sonner"

jest.mock("sonner", () => ({
  toast: { success: jest.fn(), error: jest.fn() },
}))

const listing = {
  title: "Rumah 2 Lantai Bintaro",
  price: "3200000000",
  listingType: "jual",
  url: "https://properti-nusa.id/properti/abc",
}

function setNavigator(props: Record<string, unknown>) {
  for (const [key, value] of Object.entries(props)) {
    Object.defineProperty(window.navigator, key, {
      value,
      configurable: true,
      writable: true,
    })
  }
}

beforeEach(() => {
  jest.clearAllMocks()
  setNavigator({ share: undefined, clipboard: undefined })
})

describe("ShareButton without a native share sheet", () => {
  it("offers a share button", () => {
    render(<ShareButton {...listing} />)
    expect(screen.getByRole("button", { name: /bagikan/i })).toBeInTheDocument()
  })

  it("opens the fallback options on click", async () => {
    render(<ShareButton {...listing} />)
    await userEvent.click(screen.getByRole("button", { name: /bagikan/i }))
    expect(screen.getByRole("link", { name: /whatsapp/i })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /salin link/i })).toBeInTheDocument()
  })

  it("hands WhatsApp the listing title and link", async () => {
    render(<ShareButton {...listing} />)
    await userEvent.click(screen.getByRole("button", { name: /bagikan/i }))

    const href = screen.getByRole("link", { name: /whatsapp/i }).getAttribute("href")!
    expect(href.startsWith("https://wa.me/?text=")).toBe(true)
    const text = decodeURIComponent(new URL(href).searchParams.get("text")!)
    expect(text).toContain("Rumah 2 Lantai Bintaro")
    expect(text).toContain(listing.url)
  })

  it("copies the link and confirms it", async () => {
    const writeText = jest.fn().mockResolvedValue(undefined)
    setNavigator({ clipboard: { writeText } })

    render(<ShareButton {...listing} />)
    await userEvent.click(screen.getByRole("button", { name: /bagikan/i }))
    await userEvent.click(screen.getByRole("button", { name: /salin link/i }))

    await waitFor(() => expect(writeText).toHaveBeenCalledWith(listing.url))
    expect(toast.success).toHaveBeenCalled()
  })

  it("tells the user when copying fails instead of failing silently", async () => {
    setNavigator({ clipboard: { writeText: jest.fn().mockRejectedValue(new Error("denied")) } })

    render(<ShareButton {...listing} />)
    await userEvent.click(screen.getByRole("button", { name: /bagikan/i }))
    await userEvent.click(screen.getByRole("button", { name: /salin link/i }))

    await waitFor(() => expect(toast.error).toHaveBeenCalled())
    expect(toast.success).not.toHaveBeenCalled()
  })

  it("tells the user when the browser exposes no clipboard at all", async () => {
    render(<ShareButton {...listing} />)
    await userEvent.click(screen.getByRole("button", { name: /bagikan/i }))
    await userEvent.click(screen.getByRole("button", { name: /salin link/i }))

    await waitFor(() => expect(toast.error).toHaveBeenCalled())
  })
})

describe("ShareButton with a native share sheet", () => {
  it("opens the device share sheet instead of the fallback menu", async () => {
    const share = jest.fn().mockResolvedValue(undefined)
    setNavigator({ share })

    render(<ShareButton {...listing} />)
    await userEvent.click(screen.getByRole("button", { name: /bagikan/i }))

    await waitFor(() => expect(share).toHaveBeenCalled())
    expect(share.mock.calls[0][0]).toMatchObject({ url: listing.url })
    expect(screen.queryByRole("button", { name: /salin link/i })).not.toBeInTheDocument()
  })

  it("stays quiet when the user dismisses the share sheet", async () => {
    const abort = Object.assign(new Error("dismissed"), { name: "AbortError" })
    setNavigator({ share: jest.fn().mockRejectedValue(abort) })

    render(<ShareButton {...listing} />)
    await userEvent.click(screen.getByRole("button", { name: /bagikan/i }))

    await waitFor(() => expect(toast.error).not.toHaveBeenCalled())
  })

  it("falls back to the menu when the share sheet errors for real", async () => {
    setNavigator({ share: jest.fn().mockRejectedValue(new Error("not allowed")) })

    render(<ShareButton {...listing} />)
    await userEvent.click(screen.getByRole("button", { name: /bagikan/i }))

    expect(await screen.findByRole("button", { name: /salin link/i })).toBeInTheDocument()
  })
})
