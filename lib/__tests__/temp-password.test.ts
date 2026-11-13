import { generateTempPassword } from "@/lib/temp-password"

describe("generateTempPassword", () => {
  it("is long enough to pass the 8-character rule the app already enforces", () => {
    expect(generateTempPassword().length).toBeGreaterThanOrEqual(12)
  })

  it("never repeats", () => {
    const seen = new Set(Array.from({ length: 200 }, () => generateTempPassword()))
    expect(seen.size).toBe(200)
  })

  it("stays in a character set that survives being copied into a chat", () => {
    expect(generateTempPassword()).toMatch(/^[A-Za-z0-9]+$/)
  })
})
