"use client"

import { useEffect, useRef, useState, type ReactNode } from "react"
import { cn } from "@/lib/utils"

type RevealEffect = "rise" | "drift" | "unveil"

interface RevealProps {
  children: ReactNode
  className?: string
  /** stagger delay in ms */
  delay?: number
  /**
   * rise — the quick nudge used across the app.
   * drift — a slower, longer rise for the homepage's editorial blocks.
   * unveil — images wipe in from the bottom edge, like a curtain lifting.
   */
  effect?: RevealEffect
}

const EFFECTS: Record<RevealEffect, { base: string; hidden: string; shown: string }> = {
  rise: {
    base: "transition-all duration-[350ms] ease-[cubic-bezier(0.22,1,0.36,1)]",
    hidden: "translate-y-3 opacity-0",
    shown: "translate-y-0 opacity-100",
  },
  drift: {
    base: "transition-all duration-[1100ms] ease-[cubic-bezier(0.22,1,0.36,1)]",
    hidden: "translate-y-8 opacity-0",
    shown: "translate-y-0 opacity-100",
  },
  unveil: {
    base: "transition-[clip-path,opacity] duration-[1400ms] ease-[cubic-bezier(0.77,0,0.18,1)]",
    hidden: "opacity-0 [clip-path:inset(100%_0_0_0)]",
    shown: "opacity-100 [clip-path:inset(0_0_0_0)]",
  },
}

export default function Reveal({ children, className, delay = 0, effect = "rise" }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (typeof IntersectionObserver === "undefined") return
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          io.disconnect()
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  const e = EFFECTS[effect]

  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={cn(
        e.base,
        "motion-reduce:transition-none",
        visible ? e.shown : e.hidden,
        className,
      )}
    >
      {children}
    </div>
  )
}
