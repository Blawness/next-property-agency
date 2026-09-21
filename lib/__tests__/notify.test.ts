import { leadRecipients, buildLeadEmail } from "@/lib/notify"

describe("leadRecipients", () => {
  it("notifies the listing's agent and the office", () => {
    expect(leadRecipients({ agentEmail: "agen@kantor.id", officeEmail: "info@kantor.id" })).toEqual([
      "agen@kantor.id",
      "info@kantor.id",
    ])
  })

  it("sends one copy when the agent is the office address", () => {
    expect(leadRecipients({ agentEmail: "info@kantor.id", officeEmail: "info@kantor.id" })).toEqual([
      "info@kantor.id",
    ])
  })

  it("ignores case and surrounding space when de-duplicating", () => {
    expect(
      leadRecipients({ agentEmail: " Info@Kantor.id ", officeEmail: "info@kantor.id" }),
    ).toEqual(["info@kantor.id"])
  })

  it("falls back to the office alone when the listing has no agent", () => {
    expect(leadRecipients({ agentEmail: null, officeEmail: "info@kantor.id" })).toEqual([
      "info@kantor.id",
    ])
  })

  it("still reaches the agent when no office address is configured", () => {
    expect(leadRecipients({ agentEmail: "agen@kantor.id", officeEmail: "" })).toEqual([
      "agen@kantor.id",
    ])
  })

  it("returns nothing when there is nobody to tell", () => {
    expect(leadRecipients({ agentEmail: null, officeEmail: "" })).toEqual([])
  })
})

describe("buildLeadEmail", () => {
  const lead = {
    name: "Rina Kusuma",
    phone: "081234567890",
    email: "rina@example.com",
    message: "Apakah masih tersedia untuk kunjungan akhir pekan?",
    propertyTitle: "Rumah 2 Lantai Bintaro",
    propertyUrl: "https://properti-nusa.id/properti/abc",
  }

  it("puts the enquirer and the listing in the subject", () => {
    const { subject } = buildLeadEmail(lead)
    expect(subject).toContain("Rina Kusuma")
    expect(subject).toContain("Rumah 2 Lantai Bintaro")
  })

  it("carries every detail an agent needs to follow up", () => {
    const { text } = buildLeadEmail(lead)
    expect(text).toContain("Rina Kusuma")
    expect(text).toContain("081234567890")
    expect(text).toContain("rina@example.com")
    expect(text).toContain("Apakah masih tersedia")
    expect(text).toContain("https://properti-nusa.id/properti/abc")
  })

  it("offers a ready-to-click WhatsApp link on the normalised number", () => {
    const { html } = buildLeadEmail(lead)
    expect(html).toContain("wa.me/6281234567890")
  })

  it("reads sensibly when the enquirer left no email", () => {
    const { text, html } = buildLeadEmail({ ...lead, email: null })
    expect(text).not.toContain("null")
    expect(html).not.toContain("null")
    expect(text).toContain("081234567890")
  })

  it("reads sensibly when the enquiry is not about a listing", () => {
    const { subject, text } = buildLeadEmail({
      ...lead,
      propertyTitle: null,
      propertyUrl: null,
    })
    expect(subject).toContain("Rina Kusuma")
    expect(subject).not.toContain("null")
    expect(text).not.toContain("null")
  })

  it("escapes markup from the message so the email cannot be injected", () => {
    const { html } = buildLeadEmail({
      ...lead,
      message: 'Halo <script>alert("x")</script> apakah tersedia?',
    })
    expect(html).not.toContain("<script>")
    expect(html).toContain("&lt;script&gt;")
  })
})
