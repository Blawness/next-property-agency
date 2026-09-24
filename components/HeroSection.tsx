"use client"

import { useRef, useState, useSyncExternalStore } from "react"
import Link from "next/link"
import Image from "next/image"
import { ArrowRight } from "lucide-react"
import { BRAND } from "@/lib/brand"

const HERO_VIDEO_SOURCES = [
  { src: "/hero.av1.mp4", type: 'video/mp4; codecs="av01.0.05M.08"' },
  { src: "/hero.webm", type: 'video/webm; codecs="vp9"' },
] as const
const HERO_POSTER =
  "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=2000&q=80"

function subscribeReducedMotion(callback: () => void) {
  if (typeof window === "undefined") return () => {}
  const mq = window.matchMedia("(prefers-reduced-motion: reduce)")
  mq.addEventListener("change", callback)
  return () => mq.removeEventListener("change", callback)
}

function getReducedMotion(): boolean {
  if (typeof window === "undefined") return false
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches
}

function getServerSnapshot(): boolean {
  return false
}

export default function HeroSection() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [videoReady, setVideoReady] = useState(false)
  const reducedMotion = useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotion,
    getServerSnapshot,
  )
  const { hero } = BRAND

  return (
    // -mt-16 slides the hero up under the sticky navbar, which turns
    // transparent while it sits over this section (see Navbar).
    <section
      id="home"
      className="relative -mt-16 h-[100svh] min-h-[640px] overflow-hidden bg-[#1E130B] text-white"
    >
      {(reducedMotion || !videoReady) && (
        <div className="absolute inset-0 hero-kenburns">
          <Image
            src={HERO_POSTER}
            alt={hero.imageAlt}
            fill
            priority
            sizes="100vw"
            className="object-cover"
            style={{ objectPosition: "center 42%" }}
          />
        </div>
      )}

      {!reducedMotion && (
        <video
          ref={videoRef}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          poster={HERO_POSTER}
          onLoadedData={() => setVideoReady(true)}
          aria-hidden
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-[1500ms] ${
            videoReady ? "opacity-100" : "opacity-0"
          }`}
          style={{ objectPosition: "center 42%" }}
        >
          {HERO_VIDEO_SOURCES.map((s) => (
            <source key={s.src} src={s.src} type={s.type} />
          ))}
        </video>
      )}

      {/* Top shade keeps the navbar legible; the heavier bottom one carries the copy. */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, rgba(18,10,4,0.55) 0%, rgba(18,10,4,0.10) 28%, rgba(18,10,4,0.15) 50%, rgba(18,10,4,0.82) 100%)",
        }}
      />
      <div aria-hidden className="hero-grain absolute inset-0" />

      <div className="relative mx-auto flex h-full max-w-[1440px] flex-col justify-end px-[clamp(1.25rem,5vw,4.5rem)] pb-[clamp(2.5rem,7vh,5rem)]">
        <p className="hero-animate-badge mb-6 flex items-center gap-3 text-[11px] font-medium uppercase tracking-[0.32em] text-white/75">
          <span aria-hidden className="hero-animate-line h-px w-10 bg-gold" />
          {hero.eyebrow}
        </p>

        <h1 className="hero-animate-h1 m-0 max-w-[22ch] font-serif text-[clamp(2.75rem,7.2vw,6.75rem)] font-light leading-[0.98] tracking-[-0.01em] text-balance">
          <span className="block">{hero.headline.lead}</span>
          <span className="block italic text-[#EBD3B0]">{hero.headline.trail}</span>
        </h1>

        <div className="mt-10 flex flex-col gap-8 border-t border-white/20 pt-8 md:flex-row md:items-end md:justify-between">
          <p className="hero-animate-sub max-w-md text-[15px] leading-relaxed text-white/75 text-pretty">
            {hero.subtitle}
          </p>

          <div className="hero-animate-search flex flex-wrap items-center gap-x-8 gap-y-4">
            <Link
              href="/properti"
              className="group inline-flex h-12 items-center gap-3 bg-[#F3EDE4] px-7 text-[12px] font-semibold uppercase tracking-[0.2em] text-[#1B1B1B] transition-colors duration-500 hover:bg-gold"
            >
              {hero.primaryCta}
              <ArrowRight size={15} strokeWidth={1.5} className="transition-transform duration-500 group-hover:translate-x-1" />
            </Link>
            <a
              href="#contact"
              className="relative text-[12px] font-semibold uppercase tracking-[0.2em] text-white after:absolute after:-bottom-1.5 after:left-0 after:h-px after:w-full after:origin-right after:bg-white/60 after:transition-transform after:duration-500 hover:after:origin-left hover:after:scale-x-0"
            >
              {hero.secondaryCta}
            </a>
          </div>
        </div>
      </div>

      <span
        aria-hidden
        className="hero-scroll-cue absolute bottom-5 left-1/2 hidden h-8 w-px bg-white/50 lg:block"
      />
    </section>
  )
}
