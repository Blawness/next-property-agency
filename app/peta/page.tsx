import { db } from "@/db"
import { properties } from "@/db/schema"
import { eq, and, desc, isNull, isNotNull } from "drizzle-orm"
import SectionHeading from "@/components/SectionHeading"
import MapView from "@/components/MapView"
import { getPropertiesWithImagesBatch } from "@/lib/db-helpers"

export const revalidate = 120

// Every marker is shipped to the browser, so this page is capped rather than
// unbounded. Previously it read the whole table twice — once to fetch all active
// rows and filter coordinates in JS, then again by id.
const MAP_MARKER_LIMIT = 500

async function getPropertiesWithCoords() {
  return getPropertiesWithImagesBatch(
    db
      .select()
      .from(properties)
      .where(
        and(
          eq(properties.status, "active"),
          isNull(properties.deletedAt),
          isNotNull(properties.lat),
          isNotNull(properties.lng),
        ),
      )
      .orderBy(desc(properties.createdAt))
      .limit(MAP_MARKER_LIMIT),
  )
}

export default async function PetaPage() {
  const items = await getPropertiesWithCoords()

  return (
    <div className="container mx-auto px-4 py-10">
      <SectionHeading eyebrow="Peta" title="Peta Properti" subtitle="Jelajahi listing berdasarkan lokasi geografis" />
      <div className="overflow-hidden rounded-2xl border border-border">
        <div className="h-[calc(100vh-280px)] min-h-[480px]">
          <MapView properties={items} />
        </div>
      </div>
    </div>
  )
}
