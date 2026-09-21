"use client"

import { useEffect, useRef, useState } from "react"
import { Share2, MessageCircle, Link2, Check } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { buildShareText, buildWhatsAppShareLink } from "@/lib/share"

interface ShareButtonProps {
  title: string
  price: string
  listingType: string
  /** Absolute URL of the listing. */
  url: string
}

export default function ShareButton({ title, price, listingType, url }: ShareButtonProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!menuOpen) return
    function onPointerDown(e: MouseEvent) {
      if (!containerRef.current?.contains(e.target as Node)) setMenuOpen(false)
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setMenuOpen(false)
    }
    document.addEventListener("mousedown", onPointerDown)
    document.addEventListener("keydown", onKeyDown)
    return () => {
      document.removeEventListener("mousedown", onPointerDown)
      document.removeEventListener("keydown", onKeyDown)
    }
  }, [menuOpen])

  const shareText = buildShareText({ title, price, listingType, url })

  async function handleShare() {
    // Read the capability at click time rather than holding it in state: the
    // handler only ever runs in the browser, so there is no server render to
    // guard against and no extra render to trigger.
    if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
      try {
        await navigator.share({ title, text: shareText, url })
        return
      } catch (err) {
        // Dismissing the sheet is a choice, not a failure — say nothing.
        if (err instanceof Error && err.name === "AbortError") return
        // Anything else means the sheet is unusable here; offer the menu.
      }
    }
    setMenuOpen((open) => !open)
  }

  async function handleCopy() {
    try {
      if (!navigator.clipboard?.writeText) throw new Error("clipboard unavailable")
      await navigator.clipboard.writeText(url)
      setCopied(true)
      toast.success("Link disalin")
      setTimeout(() => setCopied(false), 2000)
      setMenuOpen(false)
    } catch {
      // The clipboard is blocked outside HTTPS and in some in-app browsers.
      // Saying so beats a button that looks like it worked.
      toast.error("Gagal menyalin link. Salin manual dari kolom alamat.")
    }
  }

  return (
    <div ref={containerRef} className="relative inline-block">
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="rounded-sm"
        aria-expanded={menuOpen}
        onClick={handleShare}
      >
        <Share2 className="mr-1.5 h-3.5 w-3.5" aria-hidden />
        Bagikan
      </Button>

      {/* A plain disclosure, deliberately not role="menu": that contract
          requires arrow-key navigation and focus management, and claiming it
          without them reads worse to a screen reader than the native link and
          button semantics below. */}
      {menuOpen && (
        <div
          className="absolute right-0 z-30 mt-1 w-56 overflow-hidden rounded-sm border border-border bg-popover shadow-md"
        >
          <a
            href={buildWhatsAppShareLink(shareText)}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setMenuOpen(false)}
            className="flex items-center gap-2.5 px-3.5 py-2.5 text-[14px] text-popover-foreground transition-colors hover:bg-muted"
          >
            <MessageCircle className="h-4 w-4 text-primary" aria-hidden />
            Bagikan lewat WhatsApp
          </a>
          <button
            type="button"
            onClick={handleCopy}
            className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-left text-[14px] text-popover-foreground transition-colors hover:bg-muted"
          >
            {copied ? (
              <Check className="h-4 w-4 text-primary" aria-hidden />
            ) : (
              <Link2 className="h-4 w-4 text-primary" aria-hidden />
            )}
            Salin link
          </button>
        </div>
      )}
    </div>
  )
}
