"use client"

import { useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import {
  IMAGE_ACCEPT,
  IMAGE_FORMATS_LABEL,
  IMAGE_TYPES,
  UPLOAD_KINDS,
  formatMegabytes,
  type UploadKind,
} from "@/lib/upload-rules"

interface ImageUploadButtonProps extends Omit<React.ComponentProps<typeof Button>, "onClick" | "onError" | "type"> {
  kind: UploadKind
  /** Called once the files are accepted, with how many are being uploaded. */
  onUploadBegin?: (count: number) => void
  /** Always called at the end, with the URLs of the files that made it, in selection order. */
  onUploadComplete: (urls: string[]) => void
  onError: (message: string) => void
}

async function uploadOne(kind: UploadKind, file: File): Promise<string> {
  const body = new FormData()
  body.set("kind", kind)
  body.set("file", file)
  const res = await fetch("/api/upload", { method: "POST", body })
  const data = (await res.json().catch(() => ({}))) as { url?: string; error?: string }
  if (!res.ok || !data.url) throw new Error(data.error ?? "Upload gagal")
  return data.url
}

/** Rejects a selection before any byte is sent; the server checks the same rules again. */
function checkSelection(kind: UploadKind, files: File[]): string | null {
  const rule = UPLOAD_KINDS[kind]
  if (files.length > rule.maxFiles) return `Maksimal ${rule.maxFiles} foto sekali upload`
  for (const file of files) {
    if (!Object.hasOwn(IMAGE_TYPES, file.type)) return `${file.name}: format harus ${IMAGE_FORMATS_LABEL}`
    if (file.size > rule.maxBytes) return `${file.name}: ukuran maksimal ${formatMegabytes(rule.maxBytes)}`
  }
  return null
}

export default function ImageUploadButton({
  kind,
  onUploadBegin,
  onUploadComplete,
  onError,
  disabled,
  children,
  ...buttonProps
}: ImageUploadButtonProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [busy, setBusy] = useState(false)

  const handleFiles = async (list: FileList | null) => {
    const files = Array.from(list ?? [])
    // Clear the input so choosing the same file again still fires `change`.
    if (inputRef.current) inputRef.current.value = ""
    if (files.length === 0) return

    const problem = checkSelection(kind, files)
    if (problem) {
      onError(problem)
      return
    }

    setBusy(true)
    onUploadBegin?.(files.length)
    const results = await Promise.allSettled(files.map((file) => uploadOne(kind, file)))
    setBusy(false)

    const urls = results.flatMap((r) => (r.status === "fulfilled" ? [r.value] : []))
    const failed = results.filter((r): r is PromiseRejectedResult => r.status === "rejected")
    if (failed.length > 0) {
      const reason = failed[0].reason instanceof Error ? failed[0].reason.message : "Upload gagal"
      onError(failed.length === files.length ? reason : `${failed.length} dari ${files.length} foto gagal: ${reason}`)
    }
    onUploadComplete(urls)
  }

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept={IMAGE_ACCEPT}
        multiple={UPLOAD_KINDS[kind].maxFiles > 1}
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
      <Button
        type="button"
        disabled={disabled || busy}
        onClick={() => inputRef.current?.click()}
        {...buttonProps}
      >
        {children}
      </Button>
    </>
  )
}
