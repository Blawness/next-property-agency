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
  /** A second, smaller photograph layered over the main one — usually a live listing. */
  secondaryImage?: string | null
}

export default function AboutSection({
  stats = DEFAULT_STATS,
  secondaryImage = null,
}: AboutSectionProps = {}) {
  return (
    <section
      id="about"
      className="mx-auto max-w-[1440px] px-[clamp(1.25rem,5vw,4.5rem)] py-[clamp(6rem,12vw,10rem)]"
    >
      <div className="grid grid-cols-1 gap-y-16 lg:grid-cols-12 lg:gap-x-12">
        <div className="lg:col-span-6 lg:pt-8">
          <Reveal effect="drift">
            <p className="mb-8 flex items-center gap-3 text-[11px] font-medium uppercase tracking-[0.32em] text-muted-foreground">
              <span className="font-serif text-[15px] italic tracking-normal text-primary">01</span>
              <span aria-hidden className="h-px w-8 bg-gold" />
              {BRAND.about.heading}
            </p>
          </Reveal>
          <Reveal effect="drift" delay={120}>
            <h2 className="m-0 font-serif text-[clamp(2.25rem,4.4vw,4rem)] font-light leading-[1.08] tracking-[-0.01em] text-foreground text-balance">
              {BRAND.about.statement}
            </h2>
          </Reveal>
          <Reveal effect="drift" delay={240}>
            <p className="mt-10 max-w-[52ch] text-[16px] leading-[1.85] text-muted-foreground text-pretty">
              {BRAND.about.body}
            </p>
          </Reveal>
        </div>

        <div className="relative lg:col-span-5 lg:col-start-8">
          <Reveal effect="unveil">
            <div className="relative aspect-[4/5] w-full overflow-hidden bg-muted">
              <Image
                src={BRAND.about.image}
                alt={BRAND.about.heading}
                fill
                sizes="(max-width: 1024px) 100vw, 40vw"
                className="object-cover"
              />
            </div>
          </Reveal>
          {secondaryImage && (
            <Reveal
              effect="unveil"
              delay={300}
              className="absolute -bottom-10 -left-6 w-[42%] border-[6px] border-background shadow-xl sm:-left-12 lg:-left-20"
            >
              <div className="relative aspect-square w-full overflow-hidden bg-muted">
                <Image src={secondaryImage} alt="" fill sizes="240px" className="object-cover" />
              </div>
            </Reveal>
          )}
        </div>
      </div>

      <dl className="mt-[clamp(5rem,9vw,8rem)] grid grid-cols-1 border-t border-border sm:grid-cols-3">
        {stats.map((s, i) => (
          <Reveal
            key={s.label}
            effect="drift"
            delay={i * 140}
            className="flex flex-col gap-3 border-b border-border py-8 sm:border-b-0 sm:border-l sm:px-8 sm:first:border-l-0 sm:first:pl-0"
          >
            <dt className="order-2 text-[11px] font-medium uppercase tracking-[0.28em] text-muted-foreground">
              {s.label}
            </dt>
            <dd className="order-1 m-0 font-serif text-[clamp(3rem,5.5vw,5rem)] font-light leading-none text-foreground">
              {s.n}
            </dd>
          </Reveal>
        ))}
      </dl>
    </section>
  )
}
