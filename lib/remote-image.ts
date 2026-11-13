import { randomUUID } from "node:crypto"
import { publicObjectPrefix, putPublicObject } from "@/lib/storage"
import {
  IMAGE_FORMATS_LABEL,
  IMAGE_TYPES,
  UPLOAD_KINDS,
  formatMegabytes,
  sniffImageType,
} from "@/lib/upload-rules"

/**
 * Copies a listing photo from a URL into the bucket, for callers that cannot
 * send file bytes (the MCP server: Claude hands over links, not files). The
 * same rules as `POST /api/upload` apply — size cap, and a Content-Type taken
 * from the bytes, never from the remote server — and a URL already in the
 * bucket is kept as is, so re-sending a listing's own gallery copies nothing.
 */

const FETCH_TIMEOUT_MS = 20_000

export class ImageImportError extends Error {
  constructor(url: string, reason: string) {
    super(`Foto ${url} tidak bisa dipakai: ${reason}`)
    this.name = "ImageImportError"
  }
}

async function readCapped(body: ReadableStream<Uint8Array>, maxBytes: number): Promise<Uint8Array | null> {
  const reader = body.getReader()
  const chunks: Uint8Array[] = []
  let size = 0
  for (;;) {
    const { done, value } = await reader.read()
    if (done) break
    size += value.byteLength
    if (size > maxBytes) {
      await reader.cancel()
      return null
    }
    chunks.push(value)
  }
  const bytes = new Uint8Array(size)
  let offset = 0
  for (const chunk of chunks) {
    bytes.set(chunk, offset)
    offset += chunk.byteLength
  }
  return bytes
}

/** The bucket URL of the photo at `url`, stored under `properties/<ownerId>/`. */
export async function importListingImage(url: string, ownerId: string): Promise<string> {
  if (url.startsWith(publicObjectPrefix())) return url

  let parsed: URL
  try {
    parsed = new URL(url)
  } catch {
    throw new ImageImportError(url, "URL tidak valid")
  }
  if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
    throw new ImageImportError(url, "hanya URL http(s) yang bisa diunduh")
  }

  const rule = UPLOAD_KINDS.propertyImages
  let res: Response
  try {
    res = await fetch(parsed, { signal: AbortSignal.timeout(FETCH_TIMEOUT_MS) })
  } catch {
    throw new ImageImportError(url, "server foto tidak menjawab")
  }
  if (!res.ok || !res.body) {
    throw new ImageImportError(url, `server foto menjawab HTTP ${res.status}`)
  }
  const tooBig = `ukuran maksimal ${formatMegabytes(rule.maxBytes)}`
  if (Number(res.headers.get("content-length") ?? 0) > rule.maxBytes) {
    await res.body.cancel()
    throw new ImageImportError(url, tooBig)
  }

  const bytes = await readCapped(res.body, rule.maxBytes)
  if (!bytes) throw new ImageImportError(url, tooBig)

  const type = sniffImageType(bytes)
  if (!type) {
    // A share page (Google Drive, Instagram, a gallery) returns HTML, not the photo.
    throw new ImageImportError(url, `isinya bukan foto ${IMAGE_FORMATS_LABEL}; pakai link langsung ke file fotonya`)
  }

  return putPublicObject(`${rule.folder}/${ownerId}/${randomUUID()}.${IMAGE_TYPES[type]}`, bytes, type)
}
