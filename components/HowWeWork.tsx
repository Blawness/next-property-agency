import Reveal from "@/components/Reveal"
import { BRAND } from "@/lib/brand"

export default function HowWeWork() {
  const { heading, subtitle, steps } = BRAND.howWeWork

  return (
    <section id="how" className="bg-accent text-accent-foreground">
      <div className="mx-auto max-w-[1440px] px-[clamp(1.25rem,5vw,4.5rem)] py-[clamp(6rem,11vw,9rem)]">
        <div className="grid grid-cols-1 gap-y-6 lg:grid-cols-12 lg:gap-x-12">
          <Reveal effect="drift" className="lg:col-span-5">
            <p className="mb-8 flex items-center gap-3 text-[11px] font-medium uppercase tracking-[0.32em] text-accent-foreground/60">
              <span className="font-serif text-[15px] italic tracking-normal text-gold">02</span>
              <span aria-hidden className="h-px w-8 bg-gold" />
              Proses
            </p>
            <h2 className="m-0 font-serif text-[clamp(2.5rem,4.8vw,4.25rem)] font-light leading-[1.02] tracking-[-0.01em]">
              {heading}
            </h2>
          </Reveal>
          <Reveal effect="drift" delay={120} className="lg:col-span-5 lg:col-start-8 lg:self-end">
            <p className="max-w-[44ch] text-[16px] leading-[1.85] text-accent-foreground/70 text-pretty">
              {subtitle} Dokumen, negosiasi, dan legalitas kami tangani — Anda cukup memilih.
            </p>
          </Reveal>
        </div>

        <ol className="mt-[clamp(4rem,7vw,6rem)] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, i) => (
            <li key={step.title}>
              <Reveal
                effect="drift"
                delay={i * 140}
                className="group h-full border-t border-accent-foreground/20 py-8 sm:pr-8 lg:py-10"
              >
                <span
                  aria-hidden
                  className="block font-serif text-[clamp(3.5rem,5vw,4.5rem)] font-light italic leading-none text-gold/80 transition-colors duration-500 group-hover:text-gold"
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-8 font-serif text-[26px] font-normal leading-tight">
                  {step.title}
                </h3>
                <p className="mt-3 max-w-[32ch] text-[14px] leading-[1.8] text-accent-foreground/65 text-pretty">
                  {step.description}
                </p>
              </Reveal>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
