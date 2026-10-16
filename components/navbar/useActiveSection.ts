"use client"

import { useEffect, useState } from "react"
import { HOME_SECTIONS } from "@/components/navbar/nav-links"

// The homepage streams in behind app/loading.tsx, so its sections can arrive
// after this runs. Look for them once a frame, for about two seconds at most.
const MAX_WAIT_FRAMES = 120

/**
 * Which homepage section is in view, or null anywhere else. The navbar lives
 * in the root layout and never remounts, so this restarts on every pathname
 * change: Beranda is a client-side link, and a section seen on an earlier visit
 * to the homepage must not stay highlighted on the next one.
 */
export function useActiveSection(pathname: string): string | null {
  const [active, setActive] = useState<string | null>(null)

  useEffect(() => {
    if (pathname !== "/") return

    let observer: IntersectionObserver | null = null
    let frame = 0
    let tries = 0

    const attach = () => {
      const elements = HOME_SECTIONS.map((id) => document.getElementById(id)).filter(
        (el): el is HTMLElement => el !== null,
      )
      if (elements.length === 0) {
        if (++tries < MAX_WAIT_FRAMES) frame = requestAnimationFrame(attach)
        return
      }

      observer = new IntersectionObserver(
        (entries) => {
          const visible = entries
            .filter((e) => e.isIntersecting)
            .sort((a, b) => b.intersectionRatio - a.intersectionRatio)
          if (visible[0]) setActive(visible[0].target.id)
        },
        { rootMargin: "-30% 0px -55% 0px", threshold: [0, 0.25, 0.5, 0.75, 1] },
      )
      elements.forEach((el) => observer!.observe(el))
    }

    attach()
    return () => {
      cancelAnimationFrame(frame)
      observer?.disconnect()
      setActive(null)
    }
  }, [pathname])

  return pathname === "/" ? active : null
}
