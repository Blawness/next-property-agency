import { NextRequest, NextResponse } from "next/server"
import { db } from "@/db"
import { favorites, properties, propertyImages } from "@/db/schema"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { eq, and, inArray, isNull } from "drizzle-orm"
import { rateLimit, getRateLimitKey } from "@/lib/rate-limit"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return NextResponse.json({ favorites: [] })

    const userId = session.user.id

    const userFavorites = await db
      .select()
      .from(favorites)
      .where(eq(favorites.userId, userId))

    if (userFavorites.length === 0) return NextResponse.json({ favorites: [] })

    const propertyIds = userFavorites.map((f) => f.propertyId!).filter(Boolean)

    const props = await db
      .select()
      .from(properties)
      .where(and(inArray(properties.id, propertyIds), isNull(properties.deletedAt)))

    const images = await db
      .select()
      .from(propertyImages)
      .where(inArray(propertyImages.propertyId, propertyIds))
      .orderBy(propertyImages.order)

    const imageMap = new Map<string, typeof images>()
    for (const img of images) {
      if (img.propertyId) {
        const arr = imageMap.get(img.propertyId) ?? []
        arr.push(img)
        imageMap.set(img.propertyId, arr)
      }
    }

    const result = props.map((prop) => ({
      ...prop,
      images: imageMap.get(prop.id) ?? [],
    }))

    return NextResponse.json({ favorites: result })
  } catch (error) {
    console.error("[GET /api/favorites]", error)
    return NextResponse.json({ error: "Terjadi kesalahan pada server" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const ip = req.headers.get("x-forwarded-for") ?? "unknown"
    const limit = await rateLimit(getRateLimitKey(ip, "favorite-toggle"), { windowMs: 60_000, max: 30 })
    if (!limit.success) {
      return NextResponse.json({ error: "Terlalu banyak permintaan. Coba lagi nanti." }, { status: 429 })
    }

    const userId = session.user.id

    const { propertyId } = await req.json()

    if (!propertyId || typeof propertyId !== "string") {
      return NextResponse.json({ error: "propertyId is required" }, { status: 400 })
    }

    const existing = await db
      .select()
      .from(favorites)
      .where(and(eq(favorites.userId, userId), eq(favorites.propertyId, propertyId)))
      .limit(1)

    if (existing.length > 0) {
      await db
        .delete(favorites)
        .where(and(eq(favorites.userId, userId), eq(favorites.propertyId, propertyId)))
      return NextResponse.json({ favorited: false })
    }

    await db.insert(favorites).values({ userId, propertyId })
    return NextResponse.json({ favorited: true })
  } catch (error) {
    console.error("[POST /api/favorites]", error)
    return NextResponse.json({ error: "Terjadi kesalahan pada server" }, { status: 500 })
  }
}
