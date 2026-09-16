import Reveal from "@/components/Reveal"

const DEFAULT_STATS = [
  { n: "20+", label: "served clients" },
  { n: "30", label: "our database" },
  { n: "99%", label: "quality property" },
] as const

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
            About Us
          </h2>
        </Reveal>
        <Reveal delay={120}>
          <p className="mt-[82px] max-w-[690px] font-sans text-[20px] leading-[34px] text-pretty text-foreground">
            TAP Catalog is a federal network of commercial real estate agencies.
            We help companies from startups to coorporations – to find rent, buy, and
            property showcase. Our team takes care of the search, negotiations, legal
            verification, and transaction support until the contract is signed.
          </p>
        </Reveal>
      </div>

      <div className="hidden md:block" aria-hidden />

      {/*
        Building silhouette rendered as a transparent PNG via background-image
        (matches mockup HTML technique). The image is 945×531px; we render it at its
        natural size and offset to show the building on the right.
      */}
      <Reveal
        delay={200}
        className="w-[260px] sm:w-[320px] md:w-[400px] h-[320px] sm:h-[400px] md:h-[500px] mt-12 md:mt-0 md:absolute md:right-[-80px] md:top-[180px] bg-no-repeat"
      >
        <div
          role="img"
          aria-label="Commercial tower"
          className="h-full w-full bg-no-repeat"
          style={{
            backgroundImage: "url('/mockup-assets/about us component.png')",
            backgroundSize: "945.3px 531.4px",
            backgroundPosition: "-301.7px -30.4px",
          }}
        />
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
