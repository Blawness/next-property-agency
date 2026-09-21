"use client"

import { useEffect, useState } from "react"
import { HOME_SECTIONS } from "@/components/navbar/nav-links"

/**
 * Which homepage section is in view, or null anywhere else. Only the homepage
 * has these sections, so the observer is not set up on other routes.
 */
export function useActiveSection(): string | null {
  const [active, setActive] = useState<string | null>(null)

  useEffect(() => {
    if (typeof window === "undefined") return
    if (window.location.pathname !== "/") return

    const elements = HOME_SECTIONS.map((id) => document.getElementById(id)).filter(
      (el): el is HTMLElement => el !== null,
    )

    if (elements.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)
        if (visible[0]) setActive(visible[0].target.id)
      },
      { rootMargin: "-30% 0px -55% 0px", threshold: [0, 0.25, 0.5, 0.75, 1] },
    )

    elements.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  return active
}
