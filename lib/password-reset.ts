import { createHash, randomBytes, randomInt } from "crypto"

/** One hour: long enough to reach an inbox, short enough to limit a leaked link. */
export const RESET_TOKEN_TTL_MS = 60 * 60 * 1000

/**
 * The token that goes in the email link. 32 bytes from the crypto RNG — never
 * Math.random(), whose output is predictable and therefore guessable.
 */
export function generateResetToken(): string {
  return randomBytes(32).toString("hex")
}

/**
 * Only the hash is stored. This database is shared with a sibling project, so
 * being able to read the token table must not be enough to take over an
 * account. SHA-256 without a salt is right here: the input is already 32 bytes
 * of entropy, so there is nothing to brute-force.
 */
export function hashResetToken(token: string): string {
  return createHash("sha256").update(token).digest("hex")
}

export interface ResetTokenState {
  expiresAt: Date
  usedAt: Date | null
}

/** A token is usable once, before it expires, and never after. */
export function isTokenUsable(token: ResetTokenState | null, now: Date = new Date()): boolean {
  if (!token) return false
  if (token.usedAt !== null) return false
  return token.expiresAt.getTime() > now.getTime()
}

// Mixed case and digits only: a temp password is read aloud or pasted into a
// chat, so punctuation that mangles in transit is not worth the entropy.
const TEMP_PASSWORD_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789"
const TEMP_PASSWORD_LENGTH = 14

/**
 * Replaces `Math.random().toString(36).slice(-8)`, which was both short and
 * predictable — its output can be reconstructed from other draws of the same
 * generator, and this password grants admin-panel access.
 */
export function generateTempPassword(): string {
  let out = ""
  for (let i = 0; i < TEMP_PASSWORD_LENGTH; i++) {
    out += TEMP_PASSWORD_ALPHABET[randomInt(TEMP_PASSWORD_ALPHABET.length)]
  }
  return out
}

/**
 * True when a JWT was minted before the account's password changed, which means
 * it belongs to a session that should no longer be trusted.
 *
 * `issuedAtSeconds` is the JWT `iat` claim — seconds, not milliseconds.
 */
export function isSessionStale(
  passwordChangedAt: Date | null | undefined,
  issuedAtSeconds: number | undefined,
): boolean {
  if (!passwordChangedAt) return false
  if (typeof issuedAtSeconds !== "number" || !Number.isFinite(issuedAtSeconds)) return false
  return passwordChangedAt.getTime() > issuedAtSeconds * 1000
}
