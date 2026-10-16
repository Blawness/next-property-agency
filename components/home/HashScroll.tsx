"use client"

import { useEffect } from "react"

/**
 * Lands `/#contact` (the navbar's Kontak, from any other page) on its section.
 * The homepage streams in behind app/loading.tsx, so the browser's own jump to
 * the fragment can fire before the section exists and silently do nothing.
 * Mounted after the page's sections, this runs once they are in the document.
 */
export default function HashScroll() {
  useEffect(() => {
    const id = decodeURIComponent(window.location.hash.slice(1))
    if (!id) return
    document.getElementById(id)?.scrollIntoView()
  }, [])

  return null
}
