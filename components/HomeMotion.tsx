"use client"

import { useGSAP } from "@gsap/react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { SplitText } from "gsap/SplitText"
import Lenis from "lenis"

gsap.registerPlugin(useGSAP, ScrollTrigger, SplitText)

// Mobile browsers resize the viewport as the address bar shows and hides;
// recalculating every trigger each time is visible jank for no gain.
ScrollTrigger.config({ ignoreMobileResize: true })

// How far a [data-parallax] layer travels, as a percentage of its own height.
// The layer bleeds 10% past its frame top and bottom (see globals.css), so it
// is 120% tall and ±8% of that stays inside the bleed.
const PARALLAX_TRAVEL = 8

/**
 * The homepage's scroll choreography. Lenis smooths the wheel, and GSAP
 * ScrollTrigger ties the rest to the scroll position through data attributes,
 * so the sections stay server components and only mark what should move:
 *
 *   data-hero-zoom    the hero photograph scales up while the hero is pinned
 *   data-hero-drift   headline lines slide apart ("left" / "right")
 *   data-hero-fade    the hero copy lifts away over the same stretch
 *   data-hero-dim     darkens the hero as the next section covers it
 *   data-expand       a full-bleed photograph opens out from a window
 *   data-parallax     an image drifts inside its frame
 *   data-split        a heading's words rise in one after another
 *   data-footer-clip  the last section shrinks into a card as the footer
 *                     ([data-footer]) rises, and the footer's
 *                     [data-footer-content] grows in behind it
 *
 * Everything moves by transform or opacity, which the compositor handles
 * without repainting; the footer's clip-path is the one exception, and it only
 * runs over the last screen of the page.
 *
 * Mounted by the homepage only, so the catalogue, the map and the admin keep
 * native scrolling. Visitors who prefer reduced motion get none of it.
 */
export default function HomeMotion() {
  useGSAP(() => {
    const mm = gsap.matchMedia()

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      // The navbar is 64px tall; anchor jumps land below it.
      // Lenis's default lerp. 0.08 gave a longer glide, but the page kept
      // moving after the wheel stopped and read as lag.
      const lenis = new Lenis({ autoRaf: false, lerp: 0.1, anchors: { offset: -64 } })
      lenis.on("scroll", ScrollTrigger.update)
      const tick = (time: number) => lenis.raf(time * 1000)
      gsap.ticker.add(tick)
      gsap.ticker.lagSmoothing(0)

      const hero = document.getElementById("home")
      if (hero) {
        // The pinned stretch runs from the top of #home to the moment the next
        // section has covered it. That section starts sliding in once the
        // overlap (the hero's negative bottom margin) reaches the screen, so
        // the timeline splits there: the photograph zooms and the copy leaves
        // first, then the hero darkens under the incoming section.
        const pinned = hero.offsetHeight - window.innerHeight
        const overlap = -(parseFloat(getComputedStyle(hero).marginBottom) || 0)
        const covering = pinned > 0 ? Math.min(overlap / pinned, 1) : 0
        gsap
          .timeline({
            defaults: { ease: "none" },
            scrollTrigger: { trigger: hero, start: "top top", end: "bottom bottom", scrub: true },
          })
          .to("[data-hero-zoom]", { scale: 1.7, ease: "power1.in", duration: 1 }, 0)
          .to('[data-hero-drift="left"]', { xPercent: -18, duration: 1 - covering }, 0)
          .to('[data-hero-drift="right"]', { xPercent: 18, duration: 1 - covering }, 0)
          .to(
            "[data-hero-fade]",
            { y: -60, autoAlpha: 0, ease: "power1.in", duration: (1 - covering) * 0.8 },
            (1 - covering) * 0.15,
          )
          .to("[data-hero-dim]", { opacity: 0.8, duration: covering }, 1 - covering)
      }

      gsap.utils.toArray<HTMLElement>("[data-expand]").forEach((frame) => {
        gsap.fromTo(
          frame,
          { scale: 0.72 },
          {
            scale: 1,
            ease: "power2.out",
            scrollTrigger: {
              trigger: frame.parentElement,
              start: "top bottom",
              end: "center center",
              scrub: 0.5,
            },
          },
        )
      })

      const footer = document.querySelector("[data-footer]")
      const lastSection = document.querySelector("[data-footer-clip]")
      if (footer && lastSection) {
        // Ends where the page does, so it always completes, however short
        // the footer is next to the screen.
        gsap
          .timeline({
            scrollTrigger: { trigger: footer, start: "top bottom", end: "bottom bottom", scrub: 0.5 },
          })
          .fromTo(
            lastSection,
            { clipPath: "inset(0% 0% 0% 0%)" },
            { clipPath: "inset(5% 16% 5% 16%)", ease: "none" },
            0,
          )
          .from("[data-footer-content]", { autoAlpha: 0, scale: 0.75, ease: "none" }, 0)
      }

      gsap.utils.toArray<HTMLElement>("[data-parallax]").forEach((layer) => {
        gsap.fromTo(
          layer,
          { yPercent: -PARALLAX_TRAVEL },
          {
            yPercent: PARALLAX_TRAVEL,
            ease: "none",
            scrollTrigger: {
              trigger: layer.parentElement,
              start: "top bottom",
              end: "bottom top",
              scrub: 0.5,
            },
          },
        )
      })

      // Split into words, never lines, so the wrap is the browser's own and a
      // late font needs no re-split. Once a heading has played it goes back to
      // plain text.
      //
      // Words, not letters, and flat. Scrolling the page with the CPU slowed
      // 4x measured 45 fps with letters flipping in 3D, 46 with letters rising
      // flat, and 50–51 with words — the same as with no split at all. fromTo with
      // explicit start values renders the hidden state here, while the page
      // loads, so nothing is read back from the DOM when a heading arrives.
      gsap.utils.toArray<HTMLElement>("[data-split]").forEach((heading) => {
        const split = SplitText.create(heading, { type: "words" })
        gsap.fromTo(
          split.words,
          { yPercent: 60, autoAlpha: 0 },
          {
            yPercent: 0,
            autoAlpha: 1,
            duration: 1,
            ease: "power3.out",
            stagger: 0.07,
            immediateRender: true,
            scrollTrigger: { trigger: heading, start: "top 88%", once: true },
            onComplete: () => split.revert(),
          },
        )
      })

      return () => {
        gsap.ticker.remove(tick)
        gsap.ticker.lagSmoothing(500, 33)
        lenis.destroy()
      }
    })
  })

  return null
}
