import {
  generateResetToken,
  hashResetToken,
  isTokenUsable,
  generateTempPassword,
  isSessionStale,
  RESET_TOKEN_TTL_MS,
} from "@/lib/password-reset"

describe("generateResetToken", () => {
  it("returns a long hex token", () => {
    const token = generateResetToken()
    expect(token).toMatch(/^[0-9a-f]{64}$/)
  })

  it("never repeats", () => {
    const seen = new Set(Array.from({ length: 200 }, () => generateResetToken()))
    expect(seen.size).toBe(200)
  })
})

describe("hashResetToken", () => {
  it("is deterministic, so a token can be looked up by its hash", () => {
    expect(hashResetToken("abc")).toBe(hashResetToken("abc"))
  })

  it("does not contain the token it hashes", () => {
    const token = generateResetToken()
    expect(hashResetToken(token)).not.toContain(token)
  })

  it("separates different tokens", () => {
    expect(hashResetToken("abc")).not.toBe(hashResetToken("abd"))
  })
})

describe("isTokenUsable", () => {
  const now = new Date("2026-09-21T10:00:00Z")

  it("accepts a fresh, unused token", () => {
    expect(
      isTokenUsable({ expiresAt: new Date("2026-09-21T10:30:00Z"), usedAt: null }, now),
    ).toBe(true)
  })

  it("rejects a token that has expired", () => {
    expect(
      isTokenUsable({ expiresAt: new Date("2026-09-21T09:59:59Z"), usedAt: null }, now),
    ).toBe(false)
  })

  it("rejects a token already spent, even while unexpired", () => {
    expect(
      isTokenUsable(
        { expiresAt: new Date("2026-09-21T10:30:00Z"), usedAt: new Date("2026-09-21T10:05:00Z") },
        now,
      ),
    ).toBe(false)
  })

  it("rejects a token expiring exactly now rather than cutting it fine", () => {
    expect(isTokenUsable({ expiresAt: now, usedAt: null }, now)).toBe(false)
  })

  it("rejects a missing token outright", () => {
    expect(isTokenUsable(null, now)).toBe(false)
  })
})

describe("RESET_TOKEN_TTL_MS", () => {
  it("is one hour — long enough to reach an inbox, short enough to matter", () => {
    expect(RESET_TOKEN_TTL_MS).toBe(60 * 60 * 1000)
  })
})

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

describe("isSessionStale", () => {
  const issuedAt = Math.floor(new Date("2026-09-21T10:00:00Z").getTime() / 1000)

  it("rejects a session issued before the password changed", () => {
    expect(isSessionStale(new Date("2026-09-21T10:05:00Z"), issuedAt)).toBe(true)
  })

  it("keeps a session issued after the password changed", () => {
    expect(isSessionStale(new Date("2026-09-21T09:55:00Z"), issuedAt)).toBe(false)
  })

  it("keeps every session when the password has never been changed", () => {
    expect(isSessionStale(null, issuedAt)).toBe(false)
    expect(isSessionStale(undefined, issuedAt)).toBe(false)
  })

  it("does not log anyone out over a missing or unreadable iat claim", () => {
    expect(isSessionStale(new Date("2026-09-21T10:05:00Z"), undefined)).toBe(false)
    expect(isSessionStale(new Date("2026-09-21T10:05:00Z"), Number.NaN)).toBe(false)
  })
})
