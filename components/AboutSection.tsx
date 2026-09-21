import Image from "next/image"
import Reveal from "@/components/Reveal"
import { BRAND } from "@/lib/brand"

const DEFAULT_STATS = BRAND.stats

interface AboutStat {
  n: string
  label: string
}

interface AboutSectionProps {
  stats?: ReadonlyArray<AboutStat>
}

export default function AboutSection({ stats = DEFAULT_STATS }: AboutSectionProps = {}) {
  return (
    <section
      id="about"
      className="relative min-h-[768px] px-[clamp(1.5rem,5vw,4.5rem)] pt-[clamp(6rem,13vw,11rem)] pb-0 grid grid-cols-1 md:[grid-template-columns:minmax(0,690px)_1fr] md:gap-x-[60px] md:items-start overflow-hidden"
    >
      <div>
        <Reveal>
          <h2 className="m-0 font-sans text-[clamp(2.5rem,5vw,3.9rem)] leading-none font-bold tracking-[-0.02em] text-foreground">
            {BRAND.about.heading}
          </h2>
        </Reveal>
        <Reveal delay={120}>
          <p className="mt-[82px] max-w-[690px] font-sans text-[20px] leading-[34px] text-pretty text-foreground">
            {BRAND.about.body}
          </p>
        </Reveal>
      </div>

      <div className="hidden md:block" aria-hidden />

      <Reveal
        delay={200}
        className="mt-12 md:mt-0 md:absolute md:right-0 md:top-[180px] md:w-[400px] lg:w-[460px]"
      >
        <div className="relative h-[320px] w-full overflow-hidden rounded-sm sm:h-[400px] md:h-[500px]">
          <Image
            src={BRAND.about.image}
            alt={BRAND.about.heading}
            fill
            sizes="(max-width: 768px) 100vw, 460px"
            className="object-cover"
          />
        </div>
      </Reveal>

      <div className="col-span-full mt-[clamp(2rem,4vw,4rem)] flex flex-col flex-wrap items-center justify-center gap-x-[clamp(2rem,6vw,7.5rem)] gap-y-12 py-8 sm:flex-row">
        {stats.map((s, i) => (
          <Reveal key={s.label} delay={i * 120} className="flex flex-col items-center gap-[22px]">
            <span className="font-sans text-[clamp(3.5rem,7.5vw,7.5rem)] leading-[0.8] font-light tracking-[-0.03em] text-foreground">
              {s.n}
            </span>
            <span className="font-sans text-[20px] whitespace-nowrap text-foreground">
              {s.label}
            </span>
          </Reveal>
        ))}
      </div>
    </section>
  )
}
