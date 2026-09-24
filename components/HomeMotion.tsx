"use client"

import { useGSAP } from "@gsap/react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { SplitText } from "gsap/SplitText"
import Lenis from "lenis"

gsap.registerPlugin(useGSAP, ScrollTrigger, SplitText)

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
 *   data-hero-fade    the hero copy lifts away over the same stretch
 *   data-parallax     an image drifts inside its frame
 *   data-split        a heading's letters flip in one after another;
 *                     data-split="words" moves whole words, for long lines
 *   data-footer-clip  the last section shrinks into a card as the footer
 *                     ([data-footer]) rises, and the footer's
 *                     [data-footer-content] grows in behind it
 *
 * Mounted by the homepage only, so the catalogue, the map and the admin keep
 * native scrolling. Visitors who prefer reduced motion get none of it.
 */
export default function HomeMotion() {
  useGSAP(() => {
    const mm = gsap.matchMedia()

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      // The navbar is 64px tall; anchor jumps land below it.
      const lenis = new Lenis({ autoRaf: false, anchors: { offset: -64 } })
      lenis.on("scroll", ScrollTrigger.update)
      const tick = (time: number) => lenis.raf(time * 1000)
      gsap.ticker.add(tick)
      gsap.ticker.lagSmoothing(0)

      const hero = document.getElementById("home")
      if (hero) {
        gsap
          .timeline({
            scrollTrigger: { trigger: hero, start: "top top", end: "bottom bottom", scrub: true },
          })
          .to("[data-hero-zoom]", { scale: 1.6, ease: "power1.in", duration: 1 }, 0)
          .to("[data-hero-fade]", { y: -80, autoAlpha: 0, ease: "power1.in", duration: 0.55 }, 0)
      }

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

      gsap.utils.toArray<HTMLElement>("[data-split]").forEach((heading) => {
        const byWord = heading.dataset.split === "words"
        SplitText.create(heading, {
          type: byWord ? "words" : "words,chars",
          autoSplit: true,
          onSplit(self) {
            return gsap.from(byWord ? self.words : self.chars, {
              yPercent: 50,
              rotationY: 90,
              autoAlpha: 0,
              transformPerspective: 600,
              duration: 0.9,
              ease: "power3.out",
              stagger: byWord ? 0.06 : 0.022,
              scrollTrigger: { trigger: heading, start: "top 88%", once: true },
            })
          },
        })
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
