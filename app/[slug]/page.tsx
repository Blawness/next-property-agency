import type { Metadata } from "next"
import { notFound } from "next/navigation"
import ComingSoon from "@/components/ComingSoon"
import { brandTitle } from "@/lib/brand"
import { COMING_SOON_SLUGS, comingSoonPage } from "@/lib/coming-soon"

// Placeholder pages for the navbar items with no content yet. Only the slugs
// in BRAND.comingSoon are built; with dynamicParams off, any other top-level
// path 404s here instead of rendering, and static routes (/properti, /agen…)
// always win over this dynamic segment.
export const dynamicParams = false

export function generateStaticParams() {
  return COMING_SOON_SLUGS.map((slug) => ({ slug }))
}

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const page = comingSoonPage((await params).slug)
  if (!page) return {}
  // Nothing to index yet; the real page will replace this.
  return { title: brandTitle(page.title), robots: { index: false } }
}

export default async function ComingSoonPage({ params }: PageProps) {
  const page = comingSoonPage((await params).slug)
  if (!page) notFound()
  return <ComingSoon title={page.title} body={page.body} />
}
