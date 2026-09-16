import "dotenv/config"

import { db } from "./index"
import { properties } from "./schema"

async function seed() {
  console.log("Menambahkan properti Tigaraksa...")

  const [inserted] = await db
    .insert(properties)
    .values({
      title: "Tanah 42.5 Ha SHM Desa Munjul Solear Tigaraksa",
      description:
        "Dijual tanah seluas 42.5 hektar di Desa Munjul, Solear, Kecamatan Tigaraksa, Kabupaten Tangerang. Lebar muka 155 meter, sudah dipagar keliling. Legalitas SHM sebanyak 85 buku. Lokasi strategis hanya 3.5 km dari pusat pemerintahan Kabupaten Tangerang. Zona perumahan. Cocok untuk pengembangan perumahan skala besar atau investasi.",
      price: "255000000000",
      type: "tanah",
      listingType: "jual",
      city: "Kabupaten Tangerang",
      address:
        "Desa Munjul, Solear, Kec. Tigaraksa, Kabupaten Tangerang, Banten",
      landArea: 425000,
      buildingArea: 0,
      bedrooms: 0,
      bathrooms: 0,
      lat: "-6.2772",
      lng: "106.4861",
      status: "active",
    })
    .returning()

  console.log("Properti berhasil ditambahkan:", inserted.id, "-", inserted.title)
}

seed().catch(console.error)
