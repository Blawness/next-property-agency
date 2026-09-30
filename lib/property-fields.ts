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
