"use client"

import { useEffect, useState } from "react"

/**
 * True while the homepage hero is still behind the navbar, so the bar can drop
 * its background and sit on the photograph. Starts true on "/" so the server
 * render already matches the first frame instead of flashing a solid bar.
 */
export function useOverHero(pathname: string): boolean {
  const onHome = pathname === "/"
  const [over, setOver] = useState(true)

  useEffect(() => {
    if (!onHome) return
    // Look the hero up on every check rather than once: the homepage streams
    // in behind app/loading.tsx, so on first run the navbar can mount before
    // the hero exists. Until it does, the viewport height stands in for it —
    // the hero is always the first section and a full screen tall.
    const update = () => {
      const hero = document.getElementById("home")
      const bottom = hero
        ? hero.getBoundingClientRect().bottom
        : window.innerHeight - window.scrollY
      setOver(bottom > 64)
    }
    update()
    window.addEventListener("scroll", update, { passive: true })
    window.addEventListener("resize", update)
    return () => {
      window.removeEventListener("scroll", update)
      window.removeEventListener("resize", update)
    }
  }, [onHome])

  return onHome && over
}
