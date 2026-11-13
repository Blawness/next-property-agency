/**
 * What may be uploaded, shared by the browser (to refuse early) and
 * `POST /api/upload` (which enforces it). Pure, so it is safe in client code.
 */

export const UPLOAD_KINDS = {
  propertyImages: { maxBytes: 4 * 1024 * 1024, maxFiles: 10, folder: "properties" },
  profileImage: { maxBytes: 2 * 1024 * 1024, maxFiles: 1, folder: "avatars" },
} as const

export type UploadKind = keyof typeof UPLOAD_KINDS

export function isUploadKind(value: unknown): value is UploadKind {
  return typeof value === "string" && Object.hasOwn(UPLOAD_KINDS, value)
}

/** Formats `next/image` can optimise. SVG is left out: served from a public bucket it can carry script. */
export const IMAGE_TYPES = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/avif": "avif",
} as const

export type ImageType = keyof typeof IMAGE_TYPES

export const IMAGE_ACCEPT = Object.keys(IMAGE_TYPES).join(",")

export const IMAGE_FORMATS_LABEL = "JPG, PNG, WebP, GIF, atau AVIF"

export function formatMegabytes(bytes: number): string {
  return `${bytes / (1024 * 1024)}MB`
}

const ascii = (bytes: Uint8Array, start: number, end: number) =>
  String.fromCharCode(...bytes.subarray(start, end))

/**
 * The image type the bytes actually are, from their signature. The browser's
 * declared type is whatever the client says, and the bucket serves objects
 * with the Content-Type stored at upload, so it must come from here.
 */
export function sniffImageType(bytes: Uint8Array): ImageType | null {
  if (bytes.length < 12) return null
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return "image/jpeg"
  if (ascii(bytes, 0, 8) === "\x89PNG\r\n\x1a\n") return "image/png"
  if (ascii(bytes, 0, 6) === "GIF87a" || ascii(bytes, 0, 6) === "GIF89a") return "image/gif"
  if (ascii(bytes, 0, 4) === "RIFF" && ascii(bytes, 8, 12) === "WEBP") return "image/webp"
  if (ascii(bytes, 4, 8) === "ftyp" && ["avif", "avis"].includes(ascii(bytes, 8, 12))) return "image/avif"
  return null
}
