"use client"

import { useEffect, useState } from "react"

const BAR_HEIGHT = 64

/**
 * True while the homepage hero is still behind the navbar, so the bar can drop
 * its background and sit on the photograph. Starts true on "/" so the server
 * render matches the first frame instead of flashing a solid bar, and restarts
 * on every pathname change: the navbar lives in the root layout and never
 * remounts, and Beranda is a client-side link.
 */
export function useOverHero(pathname: string): boolean {
  const onHome = pathname === "/"
  const [over, setOver] = useState(true)

  useEffect(() => {
    if (!onHome) return
    // Look the hero up on every check: the homepage streams in behind
    // app/loading.tsx, so the navbar can mount before the hero exists. Until
    // it does, the viewport stands in for it — the hero is the first section.
    const update = () => {
      const hero = document.getElementById("home")
      const bottom = hero ? hero.getBoundingClientRect().bottom : window.innerHeight - window.scrollY
      setOver(bottom > BAR_HEIGHT)
    }
    update()
    window.addEventListener("scroll", update, { passive: true })
    window.addEventListener("resize", update)
    return () => {
      window.removeEventListener("scroll", update)
      window.removeEventListener("resize", update)
      setOver(true)
    }
  }, [onHome])

  return onHome && over
}
