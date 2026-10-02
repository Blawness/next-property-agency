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
/** Fired on window once the curtain has gone and scrolling is released. */
export const INTRO_DONE_EVENT = "intro:done"
/** Fired while the curtain still covers the page, once every up-front
 *  photograph is decoded: the moment for work that would otherwise land on the first scroll. */
export const INTRO_PREPARE_EVENT = "intro:prepare"
/** The main thread counts as quiet after this many frames in a row... */
const SETTLE_FRAMES = 12
/** ...each shorter than this (a 60 Hz frame is 16.7 ms). */
const SETTLE_FRAME_MS = 25

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
 * The homepage's opening screen. It holds the visitor on the brand until the
 * page is ready to scroll smoothly — the photographs that load up front (the
 * hero; the rest are lazy) downloaded and decoded,
 * fonts in, scroll triggers measured, main thread quiet (see the stages
 * below) — then lifts like a curtain onto the hero. The hero's entrance
 * animations wait for the lift (`intro-active` without `intro-lifting` in
 * globals.css); scrolling, and Lenis in HomeMotion, wait until the curtain
 * has gone (INTRO_DONE_EVENT).
 *
 * The percentage is real: up to 80 for photographs and fonts, 90 once every
 * photograph is decoded, the rest as the main thread settles.
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

  // Lifting on the `load` event alone was not enough: a downloaded photograph
  // still has to be decoded, React may still be hydrating, and the scroll
  // triggers had not been measured, so all of that landed on the first scroll
  // and read as lag. The curtain therefore waits through three stages:
  //   loading   photographs downloaded, fonts ready, window `load`
  //   decoding  every photograph decoded (img.decode), then INTRO_PREPARE_EVENT
  //             so HomeMotion measures its triggers behind the curtain
  //   settling  SETTLE_FRAMES frames in a row under SETTLE_FRAME_MS — the main
  //             thread has gone quiet — before it lifts
  useEffect(() => {
    if (phase !== "loading") return
    const started = performance.now()
    let fontsReady = false
    let loaded = document.readyState === "complete"
    let stage: "loading" | "decoding" | "settling" = "loading"
    let calm = 0
    let lastFrame = started
    let target = 0
    let raf = 0
    let finished = false

    // Only the photographs that load up front (the hero). A lazy one below the
    // fold is not fetched until the visitor scrolls towards it, so waiting for
    // it would hold the curtain to INTRO_MAX_MS on every visit.
    const images = () =>
      [...document.querySelectorAll<HTMLImageElement>("main img")].filter(
        (img) => img.getAttribute("loading") !== "lazy",
      )

    const measure = () => {
      if (stage === "loading") {
        const all = images()
        const done = all.filter((img) => img.complete).length
        target = Math.round(((done + (fontsReady ? 1 : 0)) / (all.length + 1)) * 80)
        if (loaded && fontsReady && done === all.length) {
          target = 80
          stage = "decoding"
          Promise.all(all.map((img) => img.decode?.().catch(() => {})))
            .catch(() => {})
            .then(() => {
              window.dispatchEvent(new Event(INTRO_PREPARE_EVENT))
              calm = 0
              stage = "settling"
            })
        }
      } else if (stage === "settling") {
        target = 90 + Math.round((Math.min(calm, SETTLE_FRAMES) / SETTLE_FRAMES) * 10)
      }
    }

    // The counter eases towards the measured value rather than jumping.
    const tick = (now: number) => {
      const frame = now - lastFrame
      lastFrame = now
      calm = frame < SETTLE_FRAME_MS ? calm + 1 : 0
      measure()
      const next = shown.current + (target - shown.current) * 0.12
      shown.current = target - next < 0.5 ? target : next
      const value = Math.floor(shown.current)
      if (counter.current) counter.current.textContent = String(value).padStart(2, "0")
      if (bar.current) bar.current.style.transform = `scaleX(${shown.current / 100})`
      const elapsed = now - started
      const settled = stage === "settling" && calm >= SETTLE_FRAMES && elapsed >= INTRO_MIN_MS
      if ((settled || elapsed >= INTRO_MAX_MS) && !finished) {
        finished = true
        if (stage !== "settling") window.dispatchEvent(new Event(INTRO_PREPARE_EVENT))
        if (counter.current) counter.current.textContent = "100"
        if (bar.current) bar.current.style.transform = "scaleX(1)"
        setProgress(100)
        // The hero's entrance plays as the curtain rises; scrolling stays
        // locked until it has gone, so a scroll never competes with the lift.
        document.documentElement.classList.add("intro-lifting")
        setPhase("leaving")
        return
      }
      raf = requestAnimationFrame(tick)
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
    const t = setTimeout(() => {
      const root = document.documentElement
      root.classList.remove("intro-active", "intro-lifting")
      root.classList.add("intro-done")
      try {
        sessionStorage.setItem(INTRO_SEEN_KEY, "1")
      } catch {}
      window.dispatchEvent(new Event(INTRO_DONE_EVENT))
      setPhase("gone")
    }, EXIT_MS)
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
