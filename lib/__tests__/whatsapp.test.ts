import { normalizeWhatsAppNumber, buildWhatsAppLink } from "@/lib/whatsapp"

describe("normalizeWhatsAppNumber", () => {
  it("rewrites a leading 0 to Indonesia's country code", () => {
    expect(normalizeWhatsAppNumber("081234567890")).toBe("6281234567890")
  })

  it("strips spaces, dashes and the plus from an international number", () => {
    expect(normalizeWhatsAppNumber("+62 812-3456-7890")).toBe("6281234567890")
  })

  it("leaves an already-normalised number alone", () => {
    expect(normalizeWhatsAppNumber("6281234567890")).toBe("6281234567890")
  })

  it("prefixes a bare mobile number that starts at the 8", () => {
    expect(normalizeWhatsAppNumber("81234567890")).toBe("6281234567890")
  })

  it("keeps a non-Indonesian country code as typed", () => {
    expect(normalizeWhatsAppNumber("+1 415 555 0199")).toBe("14155550199")
  })

  it("returns null for anything too short to dial", () => {
    expect(normalizeWhatsAppNumber("12345")).toBeNull()
  })

  it("returns null for empty, blank or missing input", () => {
    expect(normalizeWhatsAppNumber("")).toBeNull()
    expect(normalizeWhatsAppNumber("   ")).toBeNull()
    expect(normalizeWhatsAppNumber(null)).toBeNull()
    expect(normalizeWhatsAppNumber(undefined)).toBeNull()
  })

  it("returns null when the input holds no digits at all", () => {
    expect(normalizeWhatsAppNumber("hubungi kami")).toBeNull()
  })
})

describe("buildWhatsAppLink", () => {
  const listing = {
    title: "Rumah Minimalis Bintaro",
    price: "1500000000",
    listingType: "jual" as const,
    url: "https://properti-nusa.id/properti/abc",
  }

  it("builds a wa.me link to the agent's normalised number", () => {
    const href = buildWhatsAppLink({ ...listing, agentPhone: "081234567890" })
    expect(href).not.toBeNull()
    expect(href!.startsWith("https://wa.me/6281234567890?text=")).toBe(true)
  })

  it("pre-fills the title, the formatted price and the listing URL", () => {
    const href = buildWhatsAppLink({ ...listing, agentPhone: "081234567890" })
    const text = decodeURIComponent(new URL(href!).searchParams.get("text")!)
    expect(text).toContain("Rumah Minimalis Bintaro")
    expect(text).toContain("Rp 1.50 Miliar")
    expect(text).toContain("https://properti-nusa.id/properti/abc")
  })

  it("marks a rental price per month", () => {
    const href = buildWhatsAppLink({
      ...listing,
      price: "25000000",
      listingType: "sewa",
      agentPhone: "081234567890",
    })
    const text = decodeURIComponent(new URL(href!).searchParams.get("text")!)
    expect(text).toContain("Rp 25 Juta/bulan")
  })

  it("falls back to the office number when the agent has none", () => {
    const href = buildWhatsAppLink({
      ...listing,
      agentPhone: null,
      officePhone: "02150001000",
    })
    expect(href!.startsWith("https://wa.me/622150001000?text=")).toBe(true)
  })

  it("prefers the agent over the office when both are present", () => {
    const href = buildWhatsAppLink({
      ...listing,
      agentPhone: "081234567890",
      officePhone: "02150001000",
    })
    expect(href!.startsWith("https://wa.me/6281234567890?text=")).toBe(true)
  })

  it("falls back to the office when the agent's number is unusable", () => {
    const href = buildWhatsAppLink({
      ...listing,
      agentPhone: "-",
      officePhone: "02150001000",
    })
    expect(href!.startsWith("https://wa.me/622150001000?text=")).toBe(true)
  })

  it("returns null when no number is reachable, so callers can hide the button", () => {
    expect(buildWhatsAppLink({ ...listing, agentPhone: null })).toBeNull()
    expect(buildWhatsAppLink({ ...listing, agentPhone: null, officePhone: "" })).toBeNull()
  })

  it("omits the URL line when the listing URL is unknown", () => {
    const href = buildWhatsAppLink({ ...listing, url: undefined, agentPhone: "081234567890" })
    const text = decodeURIComponent(new URL(href!).searchParams.get("text")!)
    expect(text).toContain("Rumah Minimalis Bintaro")
    expect(text).not.toContain("undefined")
  })
})
