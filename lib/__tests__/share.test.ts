import { buildShareText, buildWhatsAppShareLink } from "@/lib/share"

const listing = {
  title: "Rumah 2 Lantai Cluster Discovery, Bintaro Sektor 9",
  price: "3200000000",
  listingType: "jual",
  url: "https://properti-nusa.id/properti/abc",
}

describe("buildShareText", () => {
  it("leads with the listing title", () => {
    expect(buildShareText(listing).startsWith(listing.title)).toBe(true)
  })

  it("carries the formatted price", () => {
    expect(buildShareText(listing)).toContain("Rp 3.20 Miliar")
  })

  it("marks a rental as per month", () => {
    const text = buildShareText({ ...listing, price: "9000000", listingType: "sewa" })
    expect(text).toContain("Rp 9 Juta/bulan")
  })

  it("ends with the link, so it is the last thing a reader sees", () => {
    expect(buildShareText(listing).trimEnd().endsWith(listing.url)).toBe(true)
  })

  it("names the site, so a forwarded listing says where it came from", () => {
    expect(buildShareText(listing)).toContain("PROPERTI NUSA")
  })

  it("survives a price that cannot be parsed", () => {
    const text = buildShareText({ ...listing, price: "" })
    expect(text).toContain(listing.title)
    expect(text).not.toContain("NaN")
    expect(text).not.toContain("undefined")
  })
})

describe("buildWhatsAppShareLink", () => {
  it("opens WhatsApp with no recipient, so the sender picks the contact", () => {
    const href = buildWhatsAppShareLink("Halo")
    expect(href.startsWith("https://wa.me/?text=")).toBe(true)
  })

  it("encodes the text it is given", () => {
    const href = buildWhatsAppShareLink(buildShareText(listing))
    const text = decodeURIComponent(new URL(href).searchParams.get("text")!)
    expect(text).toContain(listing.title)
    expect(text).toContain(listing.url)
  })
})
