"use client"

import { useEffect, useRef, useState, type ReactNode } from "react"
import { cn } from "@/lib/utils"

interface RevealProps {
  children: ReactNode
  className?: string
  /** stagger delay in ms */
  delay?: number
}

// Transitions name translate and opacity only (Tailwind v4 moves with the
// `translate` property, not `transform`); `transition-all` measured as a real
// cost while scrolling. Short, and triggered just before the element enters
// the screen, so the page never scrolls ahead of its own content.
const BASE = "transition-[translate,opacity] duration-[350ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none"

export default function Reveal({ children, className, delay = 0 }: RevealProps) {
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
      { threshold: 0, rootMargin: "0px 0px 10% 0px" },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={cn(BASE, visible ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0", className)}
    >
      {children}
    </div>
  )
}
