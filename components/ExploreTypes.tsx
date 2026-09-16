import Link from "next/link"
import { db } from "@/db"
import { properties } from "@/db/schema"
import { and, eq, isNull, count } from "drizzle-orm"
import { Home, Building2, TreePalm, Store, type LucideIcon } from "lucide-react"
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
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {PROPERTY_TYPES.map((type, i) => {
        const Icon = ICONS[type]
        return (
          <Reveal key={type} delay={i * 80}>
            <Link
              href={`/properti?type=${type}`}
              className="group flex flex-col items-start gap-3 rounded-2xl border-2 border-primary p-4 transition-colors hover:bg-primary hover:text-primary-foreground sm:flex-row sm:items-center sm:gap-4 sm:p-5"
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary transition-colors group-hover:bg-primary-foreground/15 group-hover:text-primary-foreground">
                <Icon size={22} strokeWidth={1.75} />
              </span>
              <span className="flex min-w-0 flex-col">
                <span className="font-sans text-[16px] font-semibold transition-colors">
                  {PROPERTY_TYPE_LABELS[type]}
                </span>
                <span className="text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground transition-colors group-hover:text-primary-foreground/70">
                  {counts[type] ?? 0} listing
                </span>
              </span>
            </Link>
          </Reveal>
        )
      })}
    </div>
  )
}
