import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js"
import { z } from "zod"
import { db } from "@/db"
import { adminActions } from "@/db/schema"
import {
  PROPERTY_STATUSES,
  PropertyWriteError,
  createProperty,
  getAdminProperty,
  listAdminProperties,
  propertyCreateSchema,
  propertyUpdateSchema,
  updateProperty,
} from "@/lib/admin-properties"
import { BRAND } from "@/lib/brand"
import { LISTING_TYPES, PROPERTY_TYPES, SITE_URL } from "@/lib/constants"
import { getPublicAgents } from "@/lib/db-helpers"
import { validationErrorMessage } from "@/lib/property-fields"
import { getRateLimitKey, rateLimit } from "@/lib/rate-limit"
import { ImageImportError, importListingImage } from "@/lib/remote-image"
import { UPLOAD_KINDS } from "@/lib/upload-rules"

/**
 * The MCP server behind `/api/mcp`: lets an admin post and edit listings from
 * Claude. Stateless — one server per request, closed over the admin the
 * bearer token belongs to. Every rule a listing obeys comes from
 * `lib/admin-properties.ts`, the same code the admin form goes through.
 */

export interface McpAdmin {
  /** `profiles.id` */
  id: string
  name: string
}

const INSTRUCTIONS = [
  `${BRAND.name} adalah situs listing properti (${SITE_URL}). Tool ini dipakai admin untuk memasang dan mengubah listing.`,
  "Harga dalam rupiah, angka bulat tanpa titik (1,5 M = 1500000000); untuk sewa, harga per bulan.",
  "Foto diberikan sebagai link langsung ke file foto (JPG/PNG/WebP/GIF/AVIF, maks 4MB per foto, maks 10); server menyalinnya ke penyimpanan situs. Link halaman berbagi (Google Drive, Instagram) tidak bisa dipakai.",
  "Tanpa agentId, listing atas nama admin yang login; pakai list_agents untuk memilih agen.",
  "Tidak ada tool untuk menghapus: ubah status ke archived untuk menurunkan listing, sold/rented bila sudah laku.",
  "Selesai membuat atau mengubah listing, berikan url-nya ke pengguna.",
].join(" ")

const MAX_IMAGES = UPLOAD_KINDS.propertyImages.maxFiles
const listingUrl = (id: string) => `${SITE_URL}/properti/${id}`

function text(value: unknown): CallToolResult {
  return { content: [{ type: "text", text: JSON.stringify(value) }] }
}

function failure(message: string): CallToolResult {
  return { content: [{ type: "text", text: message }], isError: true }
}

class ToolInputError extends Error {}

/**
 * Tool arguments are typed (numbers, nulls); the shared schemas take the admin
 * form's strings, where "" clears a field. Converting here keeps one set of
 * validation rules for both.
 */
function asFormFields(args: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(args)) {
    if (value === undefined) continue
    out[key] = value === null ? "" : typeof value === "number" ? String(value) : value
  }
  return out
}

async function storeImages(urls: string[] | undefined, adminId: string): Promise<string[] | undefined> {
  if (urls === undefined) return undefined
  if (urls.length > MAX_IMAGES) throw new ToolInputError(`Maksimal ${MAX_IMAGES} foto per listing`)
  return Promise.all(urls.map((url) => importListingImage(url, adminId)))
}

async function logAction(admin: McpAdmin, action: string, entityId: string) {
  await db.insert(adminActions).values({
    adminId: admin.id,
    action,
    entityType: "property",
    entityId,
    metadata: JSON.stringify({ via: "claude" }),
  })
}

async function run(admin: McpAdmin, write: boolean, body: () => Promise<CallToolResult>): Promise<CallToolResult> {
  try {
    if (write) {
      const limit = await rateLimit(getRateLimitKey(admin.id, "mcp-write"), { windowMs: 60_000, max: 30 })
      if (!limit.success) return failure("Terlalu banyak perubahan dalam satu menit. Coba lagi sebentar lagi.")
    }
    return await body()
  } catch (error) {
    if (error instanceof PropertyWriteError || error instanceof ImageImportError || error instanceof ToolInputError) {
      return failure(error.message)
    }
    console.error("[MCP]", error)
    return failure("Terjadi kesalahan pada server")
  }
}

const count = (label: string) => z.number().int().min(0).nullable().optional().describe(label)

/** Listing fields as Claude sends them. Optional numbers take null to clear. */
const listingFields = {
  title: z.string().describe("Judul listing, mis. \"Rumah 2 Lantai dekat Tol Tigaraksa\""),
  description: z.string().optional().describe("Deskripsi lengkap; baris baru dipertahankan"),
  price: z.number().int().min(0).describe("Harga dalam rupiah, angka bulat; untuk sewa per bulan"),
  type: z.enum(PROPERTY_TYPES).describe("Jenis properti"),
  listingType: z.enum(LISTING_TYPES).describe("jual atau sewa"),
  city: z.string().describe("Kota/kabupaten, mis. \"Tangerang\""),
  address: z.string().nullable().optional().describe("Alamat atau nama perumahan/jalan"),
  lat: z.number().min(-90).max(90).nullable().optional().describe("Latitude, untuk pin di peta"),
  lng: z.number().min(-180).max(180).nullable().optional().describe("Longitude, untuk pin di peta"),
  landArea: count("Luas tanah (m²)"),
  buildingArea: count("Luas bangunan (m²)"),
  bedrooms: count("Kamar tidur; diabaikan untuk tanah"),
  bathrooms: count("Kamar mandi; diabaikan untuk tanah"),
  agentId: z.string().optional().describe("id agen dari list_agents; kosong = admin yang login"),
  imageUrls: z
    .array(z.string().url())
    .max(MAX_IMAGES)
    .optional()
    .describe(`Link langsung ke file foto, maks ${MAX_IMAGES}; foto pertama jadi sampul`),
}

const id = z.string().describe("id listing (dari list_properties atau create_property)")

export function buildMcpServer(admin: McpAdmin): McpServer {
  const server = new McpServer({ name: "trihuni", version: "1.0.0" }, { instructions: INSTRUCTIONS })

  server.registerTool(
    "list_agents",
    {
      title: "Daftar agen",
      description: "Semua agen beserta jumlah listing aktifnya. Pakai id-nya sebagai agentId saat membuat listing.",
      annotations: { readOnlyHint: true, openWorldHint: false },
    },
    () =>
      run(admin, false, async () => {
        const agents = await getPublicAgents()
        return text(
          agents.map((a) => ({
            id: a.id,
            name: a.fullName,
            title: a.title,
            phone: a.phone,
            activeListings: a.listingCount,
          })),
        )
      }),
  )

  server.registerTool(
    "list_properties",
    {
      title: "Cari listing",
      description:
        "Listing yang belum dihapus, terbaru dulu, dengan filter. Untuk mencari listing yang mau diubah, atau mengecek duplikat sebelum memasang.",
      inputSchema: {
        search: z.string().optional().describe("Kata di judul atau kota"),
        status: z.enum(PROPERTY_STATUSES).optional(),
        type: z.enum(PROPERTY_TYPES).optional(),
        listingType: z.enum(LISTING_TYPES).optional(),
        city: z.string().optional().describe("Nama kota persis"),
        page: z.number().int().min(1).optional(),
        limit: z.number().int().min(1).max(50).optional().describe("Default 20"),
      },
      annotations: { readOnlyHint: true, openWorldHint: false },
    },
    (args) =>
      run(admin, false, async () => {
        const result = await listAdminProperties({ ...args, page: args.page ?? 1, limit: args.limit ?? 20 })
        return text({
          ...result,
          items: result.items.map((p) => ({
            id: p.id,
            title: p.title,
            price: p.price,
            type: p.type,
            listingType: p.listingType,
            status: p.status,
            city: p.city,
            agentId: p.agentId,
            primaryImageUrl: p.primaryImageUrl,
            createdAt: p.createdAt,
            url: listingUrl(p.id),
          })),
        })
      }),
  )

  server.registerTool(
    "get_property",
    {
      title: "Detail listing",
      description: "Semua field satu listing beserta fotonya, berurutan.",
      inputSchema: { id },
      annotations: { readOnlyHint: true, openWorldHint: false },
    },
    (args) =>
      run(admin, false, async () => {
        const property = await getAdminProperty(args.id)
        if (!property) return failure("Properti tidak ditemukan")
        return text({ ...property, images: property.images.map((img) => img.url), url: listingUrl(property.id) })
      }),
  )

  server.registerTool(
    "create_property",
    {
      title: "Pasang listing",
      description:
        "Memasang listing baru, langsung tayang (status active) di situs. Cek duplikat dengan list_properties dulu bila ragu.",
      inputSchema: listingFields,
      annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: true },
    },
    ({ imageUrls: rawImages, ...args }) =>
      run(admin, true, async () => {
        const parsed = propertyCreateSchema.omit({ imageUrls: true }).safeParse(asFormFields(args))
        if (!parsed.success) return failure(validationErrorMessage(parsed.error))
        const imageUrls = await storeImages(rawImages, admin.id)
        const propertyId = await createProperty({ ...parsed.data, imageUrls }, admin.id)
        await logAction(admin, "property.create", propertyId)
        return text({ id: propertyId, url: listingUrl(propertyId), images: imageUrls ?? [] })
      }),
  )

  server.registerTool(
    "update_property",
    {
      title: "Ubah listing",
      description:
        "Mengubah sebagian field listing; field yang tidak dikirim tetap. imageUrls mengganti seluruh galeri sesuai urutan (sertakan URL foto lama yang mau dipertahankan, dari get_property). status: active (tayang), sold, rented, archived (diturunkan).",
      inputSchema: {
        id,
        ...z.object(listingFields).partial().shape,
        status: z.enum(PROPERTY_STATUSES).optional(),
      },
      annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: true, openWorldHint: true },
    },
    ({ id: propertyId, imageUrls: rawImages, ...args }) =>
      run(admin, true, async () => {
        const parsed = propertyUpdateSchema.omit({ imageUrls: true }).safeParse(asFormFields(args))
        if (!parsed.success) return failure(validationErrorMessage(parsed.error))
        if (!(await getAdminProperty(propertyId))) return failure("Properti tidak ditemukan")
        const imageUrls = await storeImages(rawImages, admin.id)
        await updateProperty(propertyId, { ...parsed.data, imageUrls })
        await logAction(admin, "property.update", propertyId)
        return text({ id: propertyId, url: listingUrl(propertyId), ...(imageUrls && { images: imageUrls }) })
      }),
  )

  return server
}
