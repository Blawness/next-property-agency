import "dotenv/config"

import { db } from "./index"
import { profiles, properties, propertyImages } from "./schema"
import { eq } from "drizzle-orm"

/**
 * Additive listing seed — unlike `db/seed.ts`, this NEVER deletes. That script
 * truncates profiles, properties and images before inserting, which on a shared
 * database would take the admin account and the sibling site's data with it.
 *
 * Listings here are written for this project: real neighbourhoods and prices in
 * the right range for the market, but original copy and Unsplash photography —
 * no listing text or imagery lifted from a working agency.
 *
 * Re-running skips any listing whose title is already in the database, so it is
 * safe to run twice. Remove what it added with:
 *
 *   DELETE FROM property_images WHERE property_id IN (
 *     SELECT id FROM properties WHERE title IN (…titles below…));
 *   DELETE FROM properties WHERE title IN (…titles below…);
 */

/** Unsplash ids already proven to resolve, reused from the original seed. */
const PHOTO = {
  houseFront: "1564013799919-ab600027ffc6",
  houseModern: "1512845296467-183ccf124347",
  houseWarm: "1475875518799-44f63f828ab8",
  interior: "1521208059781-bcf3fd4d1245",
  interiorLight: "1525953776754-6c4b7ee655ab",
  living: "1514895413746-feb3d266273d",
  apartment: "1464746133101-a2c3f88e0dd9",
  apartmentTower: "1486407611111-a8df5e5d1e7a",
  land: "1654230163544-b69049014b60",
  landOpen: "1663293761246-56a9b0693052",
  shop: "1697604501923-2590ec2d7ca9",
  shopRow: "1701589212541-a0949839a1c3",
  villa: "1719887805632-de5be825f72b",
  terrace: "1637968892928-705abff0e1b3",
  garden: "1563206116-6423dace2ccf",
} as const

type PropertyType = "rumah" | "apartemen" | "tanah" | "ruko"
type ListingType = "jual" | "sewa"

interface ListingSeed {
  title: string
  description: string
  /** Rupiah. For `sewa` this is the monthly rate — the UI renders it as /bulan. */
  price: string
  type: PropertyType
  listingType: ListingType
  city: string
  address: string
  lat: string
  lng: string
  landArea?: number
  buildingArea?: number
  bedrooms?: number
  bathrooms?: number
  photos: string[]
}

const LISTINGS: ListingSeed[] = [
  {
    title: "Rumah 2 Lantai Cluster Discovery, Bintaro Sektor 9",
    description:
      "Rumah hadap timur di cluster dengan one gate system dan keamanan 24 jam. Dua lantai, empat kamar tidur termasuk kamar utama dengan kamar mandi dalam, serta satu kamar pembantu di belakang. Carport muat dua mobil. Sudah renovasi dapur tahun lalu, listrik 3.500 watt, sumber air PAM. Lima menit ke pintu tol Bintaro dan dekat sekolah internasional.",
    price: "3200000000",
    type: "rumah",
    listingType: "jual",
    city: "Tangerang",
    address: "Jl. Maleo Raya, Bintaro Jaya Sektor 9, Tangerang Selatan",
    lat: "-6.2847",
    lng: "106.7192",
    landArea: 150,
    buildingArea: 180,
    bedrooms: 4,
    bathrooms: 3,
    photos: [PHOTO.houseModern, PHOTO.interior, PHOTO.living, PHOTO.garden],
  },
  {
    title: "Rumah Cluster Nusaloka BSD, Siap Huni",
    description:
      "Rumah satu setengah lantai di kawasan Nusaloka BSD. Tiga kamar tidur, dua kamar mandi, ruang keluarga menyatu dengan dapur. Taman belakang masih kosong, cocok untuk perluasan. Sertifikat SHM atas nama penjual, IMB lengkap, bebas banjir. Dekat AEON Mall dan stasiun Cisauk.",
    price: "1850000000",
    type: "rumah",
    listingType: "jual",
    city: "Tangerang",
    address: "Jl. Nusa Loka Raya, BSD City, Tangerang Selatan",
    lat: "-6.2985",
    lng: "106.6684",
    landArea: 105,
    buildingArea: 90,
    bedrooms: 3,
    bathrooms: 2,
    photos: [PHOTO.houseFront, PHOTO.interiorLight, PHOTO.terrace],
  },
  {
    title: "Rumah Kolonial Terawat di Menteng, Jakarta Pusat",
    description:
      "Rumah lama dengan langit-langit tinggi dan lantai tegel asli yang masih utuh. Berdiri di atas tanah 420 meter dengan pohon besar di halaman depan. Empat kamar tidur, dua ruang tamu, paviliun terpisah di belakang. Cocok untuk hunian keluarga besar atau dialihfungsikan menjadi kantor. Lokasi tenang, satu blok dari Taman Suropati.",
    price: "18500000000",
    type: "rumah",
    listingType: "jual",
    city: "Jakarta",
    address: "Jl. Cikini Raya, Menteng, Jakarta Pusat",
    lat: "-6.1944",
    lng: "106.8389",
    landArea: 420,
    buildingArea: 350,
    bedrooms: 4,
    bathrooms: 3,
    photos: [PHOTO.houseWarm, PHOTO.living, PHOTO.interior],
  },
  {
    title: "Apartemen Taman Anggrek 2BR Furnished, Disewakan",
    description:
      "Unit dua kamar tidur di tower tengah, lantai 21, menghadap kota. Sudah full furnished — AC di setiap kamar, kitchen set, mesin cuci, dan TV. Akses langsung ke mal tanpa keluar gedung. Termasuk satu slot parkir. Minimum sewa satu tahun, pembayaran tahunan di muka.",
    price: "9500000",
    type: "apartemen",
    listingType: "sewa",
    city: "Jakarta",
    address: "Jl. Letjen S. Parman, Tanjung Duren, Jakarta Barat",
    lat: "-6.1781",
    lng: "106.7922",
    buildingArea: 68,
    bedrooms: 2,
    bathrooms: 1,
    photos: [PHOTO.apartment, PHOTO.interiorLight, PHOTO.living],
  },
  {
    title: "Apartemen Studio Podomoro Bandung, Lantai 12",
    description:
      "Unit studio 26 meter dalam kondisi kosong, siap diisi sesuai selera. Jendela besar menghadap barat, dapat cahaya sore. Gedung menyediakan kolam renang, pusat kebugaran, dan keamanan 24 jam. Sepuluh menit ke Jalan Pasteur dan dekat beberapa kampus. Cocok untuk investasi sewa mahasiswa.",
    price: "450000000",
    type: "apartemen",
    listingType: "jual",
    city: "Bandung",
    address: "Jl. Jenderal Sudirman, Andir, Kota Bandung",
    lat: "-6.9147",
    lng: "107.5794",
    buildingArea: 26,
    bedrooms: 1,
    bathrooms: 1,
    photos: [PHOTO.apartmentTower, PHOTO.interior],
  },
  {
    title: "Rumah Joglo Modern di Jalan Kaliurang KM 9, Yogyakarta",
    description:
      "Rumah dengan struktur joglo kayu jati yang dipadukan bangunan modern di sisi belakang. Tiga kamar tidur, dua kamar mandi, pendapa terbuka yang biasa dipakai menerima tamu. Halaman luas dengan beberapa pohon buah. Udara sejuk, akses mudah ke kampus UGM dan UII.",
    price: "1250000000",
    type: "rumah",
    listingType: "jual",
    city: "Yogyakarta",
    address: "Jl. Kaliurang KM 9, Ngaglik, Sleman",
    lat: "-7.7204",
    lng: "110.4092",
    landArea: 250,
    buildingArea: 140,
    bedrooms: 3,
    bathrooms: 2,
    photos: [PHOTO.houseWarm, PHOTO.terrace, PHOTO.garden],
  },
  {
    title: "Ruko 3 Lantai Gading Serpong, Hook",
    description:
      "Ruko posisi hook di boulevard utama, dua muka sehingga papan nama terlihat dari dua arah. Tiga lantai plus rooftop, lantai dasar sudah berkeramik dan siap dipakai. Listrik 5.500 watt, toilet di setiap lantai. Lingkungan ruko aktif dengan kafe, klinik, dan kantor notaris di deretan yang sama.",
    price: "4500000000",
    type: "ruko",
    listingType: "jual",
    city: "Tangerang",
    address: "Jl. Boulevard Gading Serpong, Kelapa Dua, Tangerang",
    lat: "-6.2419",
    lng: "106.6284",
    landArea: 72,
    buildingArea: 200,
    photos: [PHOTO.shop, PHOTO.shopRow],
  },
  {
    title: "Ruko 2 Lantai Rungkut Surabaya, Disewakan",
    description:
      "Ruko di jalur ramai dekat kawasan industri Rungkut. Lantai bawah terbuka tanpa sekat, lantai atas terbagi dua ruangan. Sudah ada rolling door dan pendingin di lantai atas. Cocok untuk kantor perwakilan, gudang kecil, atau usaha kuliner. Harga sewa per bulan, minimum dua tahun.",
    price: "12000000",
    type: "ruko",
    listingType: "sewa",
    city: "Surabaya",
    address: "Jl. Raya Rungkut Industri, Rungkut, Surabaya",
    lat: "-7.3298",
    lng: "112.7681",
    landArea: 60,
    buildingArea: 110,
    photos: [PHOTO.shopRow, PHOTO.shop],
  },
  {
    title: "Tanah Kavling 500 m² di Canggu, Badung",
    description:
      "Kavling siap bangun di jalur Pererenan menuju Canggu, sudah berbentuk persegi sehingga mudah ditata. Akses jalan aspal selebar enam meter, listrik dan air sudah tersedia di depan kavling. Zona pariwisata, izin akomodasi memungkinkan. Sepuluh menit ke pantai, dikelilingi vila yang sudah berdiri.",
    price: "7500000000",
    type: "tanah",
    listingType: "jual",
    city: "Bali",
    address: "Jl. Pantai Pererenan, Mengwi, Badung",
    lat: "-8.6423",
    lng: "115.1281",
    landArea: 500,
    photos: [PHOTO.land, PHOTO.landOpen],
  },
  {
    title: "Tanah Darat 1.200 m² Sentul, Bogor",
    description:
      "Tanah darat berkontur landai dengan pemandangan terbuka ke arah Gunung Pancar. Sertifikat SHM, sudah dipecah dan siap balik nama. Akses mobil sampai ke lokasi. Cocok untuk vila akhir pekan atau dipecah menjadi beberapa kavling. Lima belas menit dari pintu tol Sentul Selatan.",
    price: "2400000000",
    type: "tanah",
    listingType: "jual",
    city: "Bogor",
    address: "Desa Karang Tengah, Babakan Madang, Bogor",
    lat: "-6.5729",
    lng: "106.8641",
    landArea: 1200,
    photos: [PHOTO.landOpen, PHOTO.land],
  },
  {
    title: "Vila 3 Kamar dengan Kolam Renang di Ubud",
    description:
      "Vila satu lantai di tengah kebun dengan kolam renang pribadi sepanjang delapan meter. Tiga kamar tidur dengan kamar mandi dalam, dapur terbuka, dan bale bengong menghadap sawah. Dijual lengkap dengan perabot dan perizinan yang masih berlaku. Sudah berjalan sebagai sewa harian dengan tingkat hunian yang stabil.",
    price: "6800000000",
    type: "rumah",
    listingType: "jual",
    city: "Bali",
    address: "Jl. Raya Sayan, Ubud, Gianyar",
    lat: "-8.5069",
    lng: "115.2472",
    landArea: 600,
    buildingArea: 220,
    bedrooms: 3,
    bathrooms: 3,
    photos: [PHOTO.villa, PHOTO.garden, PHOTO.living, PHOTO.terrace],
  },
  {
    title: "Rumah Minimalis Grand Depok City, Disewakan",
    description:
      "Rumah satu lantai di cluster dengan keamanan portal. Dua kamar tidur, satu kamar mandi, ruang tamu dan dapur bersih. Kondisi kosong, sudah dicat ulang. Air sumur bor jernih, listrik 2.200 watt. Dekat pintu tol Cijago dan pasar tradisional. Harga per bulan, minimum sewa satu tahun.",
    price: "3500000",
    type: "rumah",
    listingType: "sewa",
    city: "Depok",
    address: "Jl. Boulevard Grand Depok City, Tirtajaya, Depok",
    lat: "-6.3912",
    lng: "106.8317",
    landArea: 90,
    buildingArea: 60,
    bedrooms: 2,
    bathrooms: 1,
    photos: [PHOTO.houseFront, PHOTO.interiorLight],
  },
]

function photoUrl(id: string, primary: boolean): string {
  const size = primary ? "w=1200&h=800" : "w=800&h=600"
  return `https://images.unsplash.com/photo-${id}?${size}&fit=crop&auto=format&q=80`
}

async function main() {
  const agents = await db
    .select({ id: profiles.id, fullName: profiles.fullName })
    .from(profiles)
    .where(eq(profiles.role, "agent"))
    .orderBy(profiles.fullName)

  if (agents.length === 0) {
    console.error("No agents on file — create one in /admin/agent first.")
    process.exit(1)
  }

  const existingTitles = new Set(
    (await db.select({ title: properties.title }).from(properties)).map((r) => r.title),
  )

  const pending = LISTINGS.filter((l) => !existingTitles.has(l.title))
  if (pending.length === 0) {
    console.log("Every listing in this seed is already in the database. Nothing to do.")
    return
  }

  const inserted = await db
    .insert(properties)
    .values(
      pending.map((l, i) => ({
        title: l.title,
        description: l.description,
        price: l.price,
        type: l.type,
        listingType: l.listingType,
        city: l.city,
        address: l.address,
        lat: l.lat,
        lng: l.lng,
        landArea: l.landArea ?? null,
        buildingArea: l.buildingArea ?? null,
        bedrooms: l.bedrooms ?? null,
        bathrooms: l.bathrooms ?? null,
        // Round-robin so every agent's profile page has something on it.
        agentId: agents[i % agents.length].id,
        status: "active" as const,
      })),
    )
    .returning({ id: properties.id, title: properties.title })

  const photosByTitle = new Map(pending.map((l) => [l.title, l.photos]))
  const images = inserted.flatMap((row) =>
    (photosByTitle.get(row.title) ?? []).map((photoId, order) => ({
      propertyId: row.id,
      url: photoUrl(photoId, order === 0),
      isPrimary: order === 0,
      order,
    })),
  )

  if (images.length > 0) await db.insert(propertyImages).values(images)

  console.log(
    `Inserted ${inserted.length} listings and ${images.length} images across ${agents.length} agents:`,
  )
  for (const agent of agents) console.log(`  - ${agent.fullName}`)
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
