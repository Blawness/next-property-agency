import type { MetadataRoute } from "next"
import { db } from "@/db"
import { properties } from "@/db/schema"
import { eq, desc, and, isNull } from "drizzle-orm"

const BASE = process.env.NEXTAUTH_URL ?? "http://localhost:3000"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const rows = await db
    .select({ id: properties.id, updatedAt: properties.updatedAt })
    .from(properties)
    .where(and(eq(properties.status, "active"), isNull(properties.deletedAt)))
    .orderBy(desc(properties.createdAt))

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${BASE}/`, changeFrequency: "daily", priority: 1.0 },
    { url: `${BASE}/properti`, changeFrequency: "hourly", priority: 0.9 },
    { url: `${BASE}/peta`, changeFrequency: "daily", priority: 0.7 },
  ]

  const propertyRoutes: MetadataRoute.Sitemap = rows.map((r) => ({
    url: `${BASE}/properti/${r.id}`,
    lastModified: r.updatedAt ?? new Date(),
    changeFrequency: "weekly",
    priority: 0.8,
  }))

  return [...staticRoutes, ...propertyRoutes]
}
