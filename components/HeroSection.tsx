"use client"

import { useRef, useState, useSyncExternalStore } from "react"
import Link from "next/link"
import Image from "next/image"
import { ChevronRight } from "lucide-react"

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

  return (
    <section
      id="home"
      className="relative overflow-hidden h-[78vh] min-h-[560px] max-h-[820px] bg-[#1a0d05]"
    >
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
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${
            videoReady ? "opacity-100" : "opacity-0"
          }`}
          style={{ objectPosition: "center 42%" }}
        >
          {HERO_VIDEO_SOURCES.map((s) => (
            <source key={s.src} src={s.src} type={s.type} />
          ))}
        </video>
      )}

      {(reducedMotion || !videoReady) && (
        <Image
          src={HERO_POSTER}
          alt="City skyline at dusk"
          fill
          priority
          sizes="100vw"
          className="object-cover"
          style={{ objectPosition: "center 42%" }}
        />
      )}

      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, rgba(20,8,2,0.55) 0%, rgba(20,8,2,0.45) 30%, rgba(20,8,2,0.20) 55%, rgba(20,8,2,0) 75%)",
        }}
      />

      <div className="relative h-full flex flex-col items-center pt-[105px]">
        <h1 className="m-0 text-center font-sans text-white leading-[1.05] tracking-[-0.015em] text-balance text-[clamp(2rem,5.2vw,3.94rem)] drop-shadow-[0_2px_24px_rgba(0,0,0,0.35)]">
          <span className="block font-light italic">Discover Your Mission</span>
          <span className="block font-bold">Build Our Passion</span>
        </h1>

        <div className="mt-auto mb-[76px] flex flex-wrap items-center justify-center gap-[clamp(2rem,5vw,5.5rem)]">
          <Link
            href="/properti"
            className="inline-flex items-center gap-2.5 h-11 px-[26px] rounded-full font-sans text-[19px] font-bold tracking-[0.05em] uppercase bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-lg shadow-black/20"
          >
            Book now
            <ChevronRight size={17} strokeWidth={2.1} />
          </Link>
          <a
            href="#contact"
            className="inline-flex items-center justify-center h-11 px-7 rounded-full font-sans text-[19px] font-bold tracking-[0.05em] uppercase bg-[#111] text-white hover:bg-black/80 transition-colors shadow-lg shadow-black/20"
          >
            For seller
          </a>
        </div>
      </div>
    </section>
  )
}
