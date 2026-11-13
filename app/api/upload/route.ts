import { randomUUID } from "node:crypto"
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { putPublicObject } from "@/lib/storage"
import {
  IMAGE_FORMATS_LABEL,
  IMAGE_TYPES,
  UPLOAD_KINDS,
  formatMegabytes,
  isUploadKind,
  sniffImageType,
} from "@/lib/upload-rules"

// One file per request: Vercel caps a function's request body at 4.5MB, which
// a single 4MB photo fits and a batch would not.
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const form = await req.formData().catch(() => null)
  const kind = form?.get("kind")
  const file = form?.get("file")
  if (!isUploadKind(kind) || !(file instanceof File)) {
    return NextResponse.json({ error: "Permintaan upload tidak valid" }, { status: 400 })
  }

  const rule = UPLOAD_KINDS[kind]
  if (file.size > rule.maxBytes) {
    return NextResponse.json(
      { error: `Ukuran foto maksimal ${formatMegabytes(rule.maxBytes)}` },
      { status: 413 },
    )
  }

  const bytes = new Uint8Array(await file.arrayBuffer())
  const type = sniffImageType(bytes)
  if (!type) {
    return NextResponse.json({ error: `Format foto harus ${IMAGE_FORMATS_LABEL}` }, { status: 415 })
  }

  try {
    const key = `${rule.folder}/${session.user.id}/${randomUUID()}.${IMAGE_TYPES[type]}`
    const url = await putPublicObject(key, bytes, type)
    return NextResponse.json({ url })
  } catch (error) {
    console.error("[POST /api/upload]", error)
    return NextResponse.json({ error: "Gagal menyimpan foto" }, { status: 502 })
  }
}
