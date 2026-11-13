import type { MetadataRoute } from "next"
import { db } from "@/db"
import { properties } from "@/db/schema"
import { eq, desc, and, isNull } from "drizzle-orm"
import { getPublicAgents } from "@/lib/db-helpers"
import { SITE_URL } from "@/lib/constants"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const rows = await db
    .select({ id: properties.id, updatedAt: properties.updatedAt })
    .from(properties)
    .where(and(eq(properties.status, "active"), isNull(properties.deletedAt)))
    .orderBy(desc(properties.createdAt))

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, changeFrequency: "daily", priority: 1.0 },
    { url: `${SITE_URL}/properti`, changeFrequency: "hourly", priority: 0.9 },
    { url: `${SITE_URL}/properti?view=peta`, changeFrequency: "daily", priority: 0.7 },
    { url: `${SITE_URL}/agen`, changeFrequency: "weekly", priority: 0.7 },
  ]

  const propertyRoutes: MetadataRoute.Sitemap = rows.map((r) => ({
    url: `${SITE_URL}/properti/${r.id}`,
    lastModified: r.updatedAt ?? new Date(),
    changeFrequency: "weekly",
    priority: 0.8,
  }))

  const agents = await getPublicAgents()
  const agentRoutes: MetadataRoute.Sitemap = agents.map((a) => ({
    url: `${SITE_URL}/agen/${a.id}`,
    changeFrequency: "weekly",
    priority: 0.6,
  }))

  return [...staticRoutes, ...propertyRoutes, ...agentRoutes]
}
