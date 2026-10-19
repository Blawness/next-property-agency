import { BRAND } from "@/lib/brand"

type Pages = typeof BRAND.comingSoon.pages
export type ComingSoonSlug = keyof Pages

/** Slugs served by app/[slug]/page.tsx — nothing else reaches that route. */
export const COMING_SOON_SLUGS = Object.keys(BRAND.comingSoon.pages) as ComingSoonSlug[]

/**
 * The placeholder page for a slug, or undefined. `Object.hasOwn`, not `in`:
 * the slug comes from the URL, and "constructor" must not find a page.
 */
export function comingSoonPage(slug: string): Pages[ComingSoonSlug] | undefined {
  const pages: Pages = BRAND.comingSoon.pages
  return Object.hasOwn(pages, slug) ? pages[slug as ComingSoonSlug] : undefined
}
