import Link from "next/link"
import {
  ArrowRight,
  MessageCircle,
  Search,
  FileText,
  Handshake,
  type LucideIcon,
} from "lucide-react"
import Reveal from "@/components/Reveal"

const STEPS: Array<{
  icon: LucideIcon
  title: string
  description: string
}> = [
  {
    icon: MessageCircle,
    title: "Free Consultation",
    description:
      "We start by understanding your needs and budget, then define exactly what kind of property fits.",
  },
  {
    icon: Search,
    title: "Search & Selection",
    description:
      "We shortlist only verified listings that match your goals — no filler, no dead ends.",
  },
  {
    icon: FileText,
    title: "Data Verification",
    description:
      "Every document, certificate, and ownership record is reviewed before you commit to anything.",
  },
  {
    icon: Handshake,
    title: "Finishing",
    description:
      "We handle the contract and stay beside you through every stage, right up to handover.",
  },
]

export default function HowWeWork() {
  return (
    <section
      id="how"
      className="px-[clamp(1.5rem,5vw,4.5rem)] pt-[clamp(6rem,13vw,12rem)] pb-[clamp(4rem,8vw,7rem)]"
    >
      <Reveal className="max-w-2xl">
        <p className="mb-3 flex items-center gap-2.5 text-[11px] font-medium uppercase tracking-[0.22em] text-primary">
          <span aria-hidden className="h-px w-6 bg-gold/70" />
          Our Process
        </p>
        <h2 className="m-0 font-sans text-[clamp(2.5rem,5vw,3.9rem)] leading-none font-bold tracking-[-0.02em] text-foreground">
          How We Work
        </h2>
        <p className="mt-5 max-w-xl font-sans text-[17px] leading-relaxed text-pretty text-muted-foreground">
          Four steps from first conversation to signed contract — with the legal
          work, the negotiation, and the paperwork carried on our side.
        </p>
      </Reveal>

      <ol className="mt-[clamp(3rem,6vw,5rem)] grid grid-cols-1 gap-y-0 md:grid-cols-2 md:gap-x-10 md:gap-y-12 lg:grid-cols-4 lg:gap-x-6">
        {STEPS.map((step, i) => {
          const Icon = step.icon
          const isLast = i === STEPS.length - 1
          return (
            <li key={step.title} className="relative flex">
              <Reveal
                delay={i * 110}
                className="group relative flex w-full gap-5 lg:flex-col lg:gap-0"
              >
                {/* Marker rail: a vertical spine on mobile, a horizontal one across the row on desktop. */}
                <div className="flex flex-col items-center lg:w-full lg:flex-row lg:items-center">
                  <span className="flex size-[60px] shrink-0 items-center justify-center rounded-full border border-primary/25 bg-background text-primary transition-colors duration-300 group-hover:border-primary group-hover:bg-primary group-hover:text-primary-foreground sm:size-[66px]">
                    <Icon size={26} strokeWidth={2} />
                  </span>
                  {!isLast && (
                    <span
                      aria-hidden
                      className="mt-3 w-px flex-1 bg-gradient-to-b from-primary/25 to-primary/5 md:hidden lg:mt-0 lg:ml-5 lg:block lg:h-px lg:w-auto lg:bg-gradient-to-r"
                    />
                  )}
                </div>

                <div className="min-w-0 pb-10 md:pb-0 lg:mt-8 lg:pb-0">
                  <div className="flex items-baseline justify-between gap-3">
                    <h3 className="font-sans text-[clamp(1.25rem,1.7vw,1.5rem)] font-bold tracking-[-0.01em] text-foreground">
                      {step.title}
                    </h3>
                    <span
                      aria-hidden
                      className="shrink-0 select-none font-sans text-[clamp(2.5rem,4vw,3.5rem)] leading-none font-light tracking-[-0.04em] opacity-70 transition-opacity duration-500 group-hover:opacity-100"
                      style={{
                        color: "transparent",
                        WebkitTextStroke: "1.5px var(--gold)",
                      }}
                    >
                      {String(i + 1).padStart(2, "0")}
                    </span>
                  </div>
                  <p className="mt-3 max-w-[34ch] font-sans text-[15px] leading-relaxed text-pretty text-muted-foreground">
                    {step.description}
                  </p>
                </div>
              </Reveal>
            </li>
          )
        })}
      </ol>

      <Reveal delay={STEPS.length * 110} className="mt-[clamp(2.5rem,5vw,4rem)]">
        <Link
          href="#contact"
          className="group inline-flex items-center gap-1.5 rounded-full border border-primary px-5 py-2.5 text-[12px] font-semibold uppercase tracking-[0.12em] text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
        >
          Mulai konsultasi
          <ArrowRight
            size={13}
            className="transition-transform group-hover:translate-x-0.5"
          />
        </Link>
      </Reveal>
    </section>
  )
}
