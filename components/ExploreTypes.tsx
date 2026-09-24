import Link from "next/link"
import { db } from "@/db"
import { properties } from "@/db/schema"
import { and, eq, isNull, count } from "drizzle-orm"
import { ArrowUpRight, Home, Building2, TreePalm, Store, type LucideIcon } from "lucide-react"
import { PROPERTY_TYPES, PROPERTY_TYPE_LABELS } from "@/lib/constants"
import Reveal from "@/components/Reveal"

const ICONS: Record<string, LucideIcon> = {
  rumah: Home,
  apartemen: Building2,
  tanah: TreePalm,
  ruko: Store,
}

async function getTypeCounts(): Promise<Record<string, number>> {
  const rows = await db
    .select({ type: properties.type, total: count() })
    .from(properties)
    .where(and(eq(properties.status, "active"), isNull(properties.deletedAt)))
    .groupBy(properties.type)
  return Object.fromEntries(rows.map((r) => [r.type, r.total]))
}

export default async function ExploreTypes() {
  const counts = await getTypeCounts()

  return (
    <div className="grid grid-cols-2 border-t border-border lg:grid-cols-4">
      {PROPERTY_TYPES.map((type, i) => {
        const Icon = ICONS[type]
        return (
          <Reveal
            key={type}
            effect="drift"
            delay={i * 100}
            className="border-b border-border even:border-l lg:border-l lg:first:border-l-0"
          >
            <Link
              href={`/properti?type=${type}`}
              className="group relative flex h-full flex-col justify-between gap-10 p-6 transition-colors duration-500 hover:bg-accent hover:text-accent-foreground sm:p-8"
            >
              <span className="flex items-start justify-between">
                <span className="font-serif text-[15px] italic text-muted-foreground transition-colors duration-500 group-hover:text-gold">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <Icon
                  size={20}
                  strokeWidth={1.25}
                  className="text-muted-foreground transition-colors duration-500 group-hover:text-gold"
                />
              </span>
              <span className="flex items-end justify-between gap-4">
                <span className="flex min-w-0 flex-col gap-2">
                  <span className="font-serif text-[clamp(1.75rem,2.6vw,2.4rem)] font-light leading-none">
                    {PROPERTY_TYPE_LABELS[type]}
                  </span>
                  <span className="text-[10px] font-medium uppercase tracking-[0.28em] text-muted-foreground transition-colors duration-500 group-hover:text-accent-foreground/60">
                    {counts[type] ?? 0} listing
                  </span>
                </span>
                <ArrowUpRight
                  size={20}
                  strokeWidth={1.25}
                  className="shrink-0 transition-transform duration-500 group-hover:-translate-y-1 group-hover:translate-x-1"
                />
              </span>
            </Link>
          </Reveal>
        )
      })}
    </div>
  )
}
