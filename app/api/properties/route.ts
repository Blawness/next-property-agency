import { NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { PropertyStatus, PropertyType } from "@/lib/types"
import { PROPERTY_TYPES } from "@/lib/constants"
import { validationErrorMessage } from "@/lib/property-fields"
import {
  PROPERTY_STATUSES,
  PropertyWriteError,
  createProperty,
  listAdminProperties,
  propertyCreateSchema,
} from "@/lib/admin-properties"
import { rateLimit, getRateLimitKey } from "@/lib/rate-limit"

function isPropertyStatus(s: string): s is PropertyStatus {
  return (PROPERTY_STATUSES as readonly string[]).includes(s)
}

function isPropertyType(s: string): s is (typeof PROPERTY_TYPES)[number] {
  return (PROPERTY_TYPES as readonly string[]).includes(s)
}

export async function GET(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { searchParams } = new URL(req.url)
    // NaN or a negative number would reach OFFSET/LIMIT and fail the query.
    const rawPage = parseInt(searchParams.get("page") ?? "1", 10)
    const rawLimit = parseInt(searchParams.get("limit") ?? "20", 10)
    const page = Number.isFinite(rawPage) && rawPage > 0 ? rawPage : 1
    const limit = Number.isFinite(rawLimit) && rawLimit > 0 ? Math.min(rawLimit, 100) : 20
    const status = searchParams.get("status")
    const type = searchParams.get("type")
    const city = searchParams.get("city")
    const search = searchParams.get("search")

    if (status && !isPropertyStatus(status)) {
      return NextResponse.json({ error: "Status tidak valid" }, { status: 400 })
    }
    if (type && !isPropertyType(type)) {
      return NextResponse.json({ error: "Tipe properti tidak valid" }, { status: 400 })
    }

    return NextResponse.json(
      await listAdminProperties({
        page,
        limit,
        status: (status as PropertyStatus) || undefined,
        type: (type as PropertyType) || undefined,
        city: city || undefined,
        search: search || undefined,
      }),
    )
  } catch (error) {
    console.error("[GET /api/properties]", error)
    return NextResponse.json({ error: "Terjadi kesalahan pada server" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    if (session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const ip = req.headers.get("x-forwarded-for") ?? "unknown"
    const limit = await rateLimit(getRateLimitKey(ip, "property-create"), { windowMs: 60_000, max: 30 })
    if (!limit.success) {
      return NextResponse.json({ error: "Terlalu banyak permintaan. Coba lagi nanti." }, { status: 429 })
    }

    const body = await req.json()
    const parsed = propertyCreateSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: validationErrorMessage(parsed.error), details: parsed.error.flatten() },
        { status: 400 },
      )
    }

    const id = await createProperty(parsed.data, session.user.id)
    return NextResponse.json({ id })
  } catch (error) {
    if (error instanceof PropertyWriteError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }
    console.error("[POST /api/properties]", error)
    return NextResponse.json({ error: "Terjadi kesalahan pada server" }, { status: 500 })
  }
}
