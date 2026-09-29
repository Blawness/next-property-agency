"use client"

import { useEffect, useLayoutEffect, useRef, useState } from "react"
import { BRAND } from "@/lib/brand"

/** How long the opening screen stays up at least, so it never just flashes. */
export const INTRO_MIN_MS = 1200
/** How long a visitor is held at most, however slow the network. */
export const INTRO_MAX_MS = 6000
/** The curtain's exit; the hero's entrance starts as it lifts. */
const EXIT_MS = 1000
/** Set once the intro has played, so a return to `/` this session skips it. */
export const INTRO_SEEN_KEY = "trihuni:intro-seen"
/** Fired on window when the page underneath is uncovered. */
export const INTRO_DONE_EVENT = "intro:done"

// useLayoutEffect warns during SSR; this component only needs it in the browser.
const useIsoLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect

/*
 * Runs during HTML parsing, before the overlay below paints:
 *  - a second visit this session gets `intro-skip`, which hides the overlay
 *    in CSS, so it never flashes;
 *  - otherwise `intro-active` locks scrolling until the intro lifts;
 *  - and, whatever happens, both are released after INTRO_MAX_MS + 2s, so a
 *    visitor whose JavaScript fails to load is never left behind the curtain.
 *    (Without JavaScript at all this never runs, and the overlay's own CSS
 *    fail-safe animation fades it out.)
 */
const PARSE_TIME_SCRIPT = `(function(){var d=document.documentElement;try{if(sessionStorage.getItem(${JSON.stringify(
  INTRO_SEEN_KEY,
)})){d.classList.add("intro-skip","intro-done");return}}catch(e){}d.classList.add("intro-active");setTimeout(function(){d.classList.remove("intro-active");d.classList.add("intro-done")},${
  INTRO_MAX_MS + 2000
})})()`

type Phase = "loading" | "leaving" | "gone"

/**
 * The homepage's opening screen. It holds the visitor on the brand while the
 * hero photograph, the fonts and the rest of the page's photographs load —
 * the window `load` event, since every homepage photograph is eager — then
 * lifts like a curtain onto the hero, whose entrance animations wait for it
 * (`html:not(.intro-done)` in globals.css). HomeMotion keeps Lenis stopped
 * until INTRO_DONE_EVENT.
 *
 * The percentage is real: photographs loaded out of those on the page, with
 * the fonts as one more step.
 */
export default function IntroLoader() {
  const [phase, setPhase] = useState<Phase>("loading")
  const [progress, setProgress] = useState(0)
  const shown = useRef(0)
  const counter = useRef<HTMLSpanElement>(null)
  const bar = useRef<HTMLSpanElement>(null)

  // A client-side return to `/` never runs the parse-time script, so check
  // again before the first paint.
  useIsoLayoutEffect(() => {
    const root = document.documentElement
    let seen = false
    try {
      seen = sessionStorage.getItem(INTRO_SEEN_KEY) !== null
    } catch {}
    if (seen || root.classList.contains("intro-skip")) {
      root.classList.remove("intro-active")
      root.classList.add("intro-skip", "intro-done")
      setPhase("gone")
      window.dispatchEvent(new Event(INTRO_DONE_EVENT))
    } else {
      root.classList.add("intro-active")
      root.classList.remove("intro-done")
    }
  }, [])

  useEffect(() => {
    if (phase !== "loading") return
    const started = performance.now()
    let fontsReady = false
    let loaded = document.readyState === "complete"
    let target = 0
    let raf = 0
    let finished = false

    const measure = () => {
      const images = [...document.querySelectorAll<HTMLImageElement>("main img")]
      const done = images.filter((img) => img.complete).length
      const steps = images.length + 1
      target = Math.round(((done + (fontsReady ? 1 : 0)) / steps) * 100)
      if (loaded) target = 100
    }

    // The counter eases towards the measured value rather than jumping.
    const tick = () => {
      measure()
      const next = shown.current + (target - shown.current) * 0.12
      shown.current = target - next < 0.5 ? target : next
      const value = Math.floor(shown.current)
      if (counter.current) counter.current.textContent = String(value).padStart(2, "0")
      if (bar.current) bar.current.style.transform = `scaleX(${shown.current / 100})`
      const elapsed = performance.now() - started
      const ready = (loaded && fontsReady && shown.current >= 100 && elapsed >= INTRO_MIN_MS) || elapsed >= INTRO_MAX_MS
      if (ready && !finished) {
        finished = true
        setProgress(100)
        finish()
        return
      }
      raf = requestAnimationFrame(tick)
    }

    const finish = () => {
      const root = document.documentElement
      root.classList.remove("intro-active")
      root.classList.add("intro-done")
      try {
        sessionStorage.setItem(INTRO_SEEN_KEY, "1")
      } catch {}
      window.dispatchEvent(new Event(INTRO_DONE_EVENT))
      setPhase("leaving")
    }

    const onLoad = () => {
      loaded = true
    }
    window.addEventListener("load", onLoad, { once: true })
    if (document.fonts) {
      document.fonts.ready.then(() => {
        fontsReady = true
      })
    } else {
      fontsReady = true
    }
    raf = requestAnimationFrame(tick)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener("load", onLoad)
    }
  }, [phase])

  useEffect(() => {
    if (phase !== "leaving") return
    const t = setTimeout(() => setPhase("gone"), EXIT_MS)
    return () => clearTimeout(t)
  }, [phase])

  if (phase === "gone") return null

  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: PARSE_TIME_SCRIPT }} />
      <div
        id="intro"
        aria-hidden
        data-phase={phase}
        className="intro-curtain fixed inset-0 z-[100] flex flex-col bg-accent text-white"
      >
        <div className="flex flex-1 flex-col items-center justify-center px-6">
          <p className="intro-rise m-0 mb-6 flex items-center gap-3 text-[11px] font-medium uppercase tracking-[0.32em] text-white/60">
            <span className="h-px w-8 bg-gold" />
            {BRAND.intro.caption}
            <span className="h-px w-8 bg-gold" />
          </p>
          <p className="intro-rise intro-wordmark m-0 font-serif text-[clamp(3rem,11vw,8.5rem)] font-light leading-none tracking-[0.18em]">
            {BRAND.logo.wordmark}
          </p>
        </div>

        <div className="mx-auto flex w-full max-w-[1440px] items-end justify-between gap-6 px-[clamp(1.25rem,5vw,4.5rem)] pb-[clamp(1.5rem,4vw,3rem)]">
          <span className="relative block h-px flex-1 overflow-hidden bg-white/15">
            {/* Scaled with an inline transform, not Tailwind's scale-x-*: in v4 those
                set the separate `scale` property, which multiplies with the
                transform and would hold the line at zero. */}
            <span ref={bar} className="absolute inset-0 origin-left bg-gold" style={{ transform: "scaleX(0)" }} />
          </span>
          <span className="font-serif text-[clamp(2rem,4vw,3.25rem)] font-light italic leading-none tabular-nums text-white/85">
            <span ref={counter}>{String(progress).padStart(2, "0")}</span>
            <span className="text-white/40">%</span>
          </span>
        </div>
      </div>
    </>
  )
}
