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
    // The homepage streams in behind app/loading.tsx, a white skeleton with
    // no hero: until #home exists the bar stays solid (a transparent bar there
    // is white on white). A MutationObserver waits for it, however long the
    // stream takes, and lets go once it is there.
    // React streams a segment into a `<div hidden>` first and moves it into
    // place once it is complete, so a hero found in there is not on screen yet.
    const update = () => {
      const found = document.getElementById("home")
      const hero = found && !found.closest("[hidden]") ? found : null
      setOver(hero ? hero.getBoundingClientRect().bottom > BAR_HEIGHT : false)
      return hero
    }
    let waiting: MutationObserver | null = null
    if (!update()) {
      waiting = new MutationObserver(() => {
        if (update()) waiting?.disconnect()
      })
      waiting.observe(document.body, { childList: true, subtree: true })
    }
    window.addEventListener("scroll", update, { passive: true })
    window.addEventListener("resize", update)
    return () => {
      window.removeEventListener("scroll", update)
      window.removeEventListener("resize", update)
      waiting?.disconnect()
      setOver(true)
    }
  }, [onHome])

  return onHome && over
}
