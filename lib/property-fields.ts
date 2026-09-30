import { z } from "zod"

/**
 * Listing fields whose column is numeric. Accepted as any string, a typo such
 * as "1,5 M" or "abc" reached Postgres as an invalid cast and came back as a
 * 500; a negative price saved fine and then rendered as "—" on every card.
 * Shared by create (POST) and edit (PATCH) so the two cannot drift apart.
 */
export const priceField = z
  .string()
  .trim()
  .min(1, "Harga wajib diisi")
  .regex(/^\d+$/, "Harga harus angka bulat tanpa titik atau koma")
  .refine((v) => v.length <= 15, "Harga terlalu besar")

/**
 * Rooms and areas. "" clears the value; otherwise a whole number of zero or
 * more — "-3" used to pass the old `!isNaN(parseInt(v))` check and print as
 * "-3 KT" on the card.
 */
export const countField = z
  .string()
  .trim()
  .refine((v) => v === "" || /^\d+$/.test(v), "Harus angka bulat, minimal 0")

/** "" clears the coordinate; anything else must be a real one. */
function coordinate(min: number, max: number, label: string) {
  return z
    .string()
    .trim()
    .refine((v) => {
      if (v === "") return true
      const n = Number(v)
      return Number.isFinite(n) && n >= min && n <= max
    }, `${label} harus angka antara ${min} dan ${max}`)
}

export const latField = coordinate(-90, 90, "Latitude")
export const lngField = coordinate(-180, 180, "Longitude")

/**
 * The admin forms show `error` and nothing else, so a bare "Validasi gagal"
 * left the admin guessing which field to fix. Leads with the first field's
 * own message instead.
 */
export function validationErrorMessage(error: z.ZodError): string {
  const issue = error.issues[0]
  return issue ? `Validasi gagal: ${issue.message}` : "Validasi gagal"
}

/**
 * Tanah has no rooms, and the form hides those fields for it — but whatever
 * was typed before switching the type to tanah was still sent and saved.
 */
export function roomsFor<T>(type: string | undefined, value: T): T | null {
  return type === "tanah" ? null : value
}
