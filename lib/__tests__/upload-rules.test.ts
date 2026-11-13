import { sniffImageType } from "@/lib/upload-rules"

const bytes = (...parts: (string | number[])[]) => {
  const out: number[] = []
  for (const part of parts) {
    if (typeof part === "string") out.push(...Array.from(part, (c) => c.charCodeAt(0)))
    else out.push(...part)
  }
  while (out.length < 16) out.push(0)
  return new Uint8Array(out)
}

describe("sniffImageType", () => {
  it.each([
    ["image/jpeg", bytes([0xff, 0xd8, 0xff, 0xe0])],
    ["image/png", bytes([0x89], "PNG\r\n\x1a\n")],
    ["image/gif", bytes("GIF89a")],
    ["image/webp", bytes("RIFF", [0, 0, 0, 0], "WEBP")],
    ["image/avif", bytes([0, 0, 0, 0x1c], "ftypavif")],
  ])("recognises %s from its signature", (type, data) => {
    expect(sniffImageType(data)).toBe(type)
  })

  it("rejects what only claims to be an image", () => {
    expect(sniffImageType(bytes("<svg xmlns='http://www.w3.org/2000/svg'>"))).toBeNull()
    expect(sniffImageType(bytes("<!DOCTYPE html><script>"))).toBeNull()
    expect(sniffImageType(bytes([0, 0, 0, 0x1c], "ftypmp42"))).toBeNull()
  })

  it("rejects a file too short to carry a signature", () => {
    expect(sniffImageType(new Uint8Array([0xff, 0xd8, 0xff]))).toBeNull()
  })
})
