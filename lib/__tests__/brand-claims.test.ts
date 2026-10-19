import { BRAND } from "@/lib/brand"

/** Every string in the brand config, however deeply nested. */
function strings(value: unknown): string[] {
  if (typeof value === "string") return [value]
  if (Array.isArray(value)) return value.flatMap(strings)
  if (value && typeof value === "object") return Object.values(value).flatMap(strings)
  return []
}

describe("brand copy", () => {
  // Nothing in the app checks documents or legal status, so the site must not
  // tell buyers that listings are verified.
  it("makes no verification or legal-check claim", () => {
    const claims = strings(BRAND).filter((s) => /verifik|terverif|legalitas/i.test(s))
    expect(claims).toEqual([])
  })
})
