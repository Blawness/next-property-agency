import { randomInt } from "crypto"

// Mixed case and digits only: a temp password is read aloud or pasted into a
// chat, so punctuation that mangles in transit is not worth the entropy.
const TEMP_PASSWORD_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789"
const TEMP_PASSWORD_LENGTH = 14

/**
 * The password an admin hands a new agent, or one locked out of their email.
 * Drawn from the crypto RNG — `Math.random()` output can be reconstructed from
 * other draws of the same generator, and this password grants panel access.
 */
export function generateTempPassword(): string {
  let out = ""
  for (let i = 0; i < TEMP_PASSWORD_LENGTH; i++) {
    out += TEMP_PASSWORD_ALPHABET[randomInt(TEMP_PASSWORD_ALPHABET.length)]
  }
  return out
}
