import Image from "next/image"
import Reveal from "@/components/Reveal"
import { BRAND } from "@/lib/brand"

interface AboutSectionProps {
  /** A second, smaller photograph layered over the main one — usually a live listing. */
  secondaryImage?: string | null
}

export default function AboutSection({ secondaryImage = null }: AboutSectionProps = {}) {
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
            <h2 data-split className="m-0 font-serif text-[clamp(2.25rem,4.4vw,4rem)] font-light leading-[1.08] tracking-[-0.01em] text-foreground text-balance">
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
              <div data-parallax>
                <Image
                  src={BRAND.about.image}
                  alt={BRAND.about.heading}
                  fill
                  sizes="(max-width: 1024px) 100vw, 40vw"
                  className="object-cover"
                />
              </div>
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
    </section>
  )
}
