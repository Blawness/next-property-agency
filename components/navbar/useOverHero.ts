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
    const hero = document.getElementById("home")
    const update = () => {
      const bottom = hero ? hero.getBoundingClientRect().bottom : 0
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
