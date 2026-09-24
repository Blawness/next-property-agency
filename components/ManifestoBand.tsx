import Image from "next/image"
import Reveal from "@/components/Reveal"
import { BRAND } from "@/lib/brand"

/**
 * A full-bleed photograph with one line of copy over it — the pause between
 * the process and the collection. The photograph is fixed in the brand config
 * rather than taken from a listing, whose quality nobody controls here.
 */
export default function ManifestoBand() {
  return (
    <section aria-label="Manifesto" className="relative h-[80svh] min-h-[520px] overflow-hidden bg-accent">
      <Image src={BRAND.manifesto.image} alt="" fill sizes="100vw" className="object-cover" />
      <div aria-hidden className="absolute inset-0 bg-[#140A04]/60" />

      <div className="relative mx-auto flex h-full max-w-[1100px] flex-col items-center justify-center px-[clamp(1.25rem,5vw,4.5rem)] text-center text-white">
        <Reveal effect="drift">
          <span aria-hidden className="mx-auto mb-10 block h-12 w-px bg-gold" />
          <blockquote className="m-0 font-serif text-[clamp(1.9rem,4vw,3.5rem)] font-light italic leading-[1.2] text-balance">
            “{BRAND.manifesto.quote}”
          </blockquote>
          <p className="mt-10 text-[11px] font-medium uppercase tracking-[0.32em] text-white/70">
            {BRAND.manifesto.attribution}
          </p>
        </Reveal>
      </div>
    </section>
  )
}
