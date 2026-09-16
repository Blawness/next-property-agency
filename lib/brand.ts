export const BRAND = {
  name: "TAP CATALOG",

  fullName: "TAP CATALOG — Katalog Properti Indonesia",

  tagline: "Katalog Properti #1 Indonesia",

  description: "Katalog properti terlengkap di Indonesia — rumah, apartemen, tanah, dan ruko",

  heroImageAlt: "TAP CATALOG — Katalog Properti Indonesia",

  pageTitle: {
    home: "TAP CATALOG – Katalog Properti Indonesia",
    catalog: "Katalog Properti — TAP CATALOG",
    map: "Peta Properti — TAP CATALOG",
    login: "Masuk — TAP CATALOG",
    register: "Daftar — TAP CATALOG",
    propertyNotFound: "Properti Tidak Ditemukan — TAP CATALOG",
    catalogHeading: "Katalog Properti",
  },

  pageDescription: {
    home: "Temukan rumah, apartemen, tanah, dan ruko terbaik di seluruh Indonesia",
    catalog: "Telusuri katalog properti terverifikasi di seluruh Indonesia",
    register: "Buat akun TAP CATALOG gratis",
    login: "Masuk ke akun TAP CATALOG kamu",
  },

  loginDescription: "Masuk ke akun TAP CATALOG kamu",
  registerDescription: "Buat akun TAP CATALOG gratis",

  exploreTypes: {
    heading: "Jelajahi Tipe Properti",
  },

  popularCities: {
    heading: "Kota Populer",
    cities: [
      { name: "Jakarta", image: "https://images.unsplash.com/photo-1555899434-94d1368aa7af?w=800&h=600&fit=crop&auto=format" },
      { name: "Bandung", image: "https://images.unsplash.com/photo-1707993467310-a5b2bb858d68?w=800&h=600&fit=crop&auto=format" },
      { name: "Surabaya", image: "https://images.unsplash.com/photo-1698139603356-d8c63b9aacce?w=800&h=600&fit=crop&auto=format" },
      { name: "Yogyakarta", image: "https://images.unsplash.com/photo-1722444924699-391078e83ad6?w=800&h=600&fit=crop&auto=format" },
      { name: "Bali", image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&h=600&fit=crop&auto=format" },
      { name: "Semarang", image: "https://images.unsplash.com/photo-1657594873796-4a121883192a?w=800&h=600&fit=crop&auto=format" },
    ],
  },

  stats: [
    { n: "15.000+", label: "Properti Aktif" },
    { n: "34", label: "Provinsi" },
    { n: "500+", label: "Agen Terpercaya" },
  ] as const,

  howWeWork: {
    heading: "Bagaimana Kami Bekerja",
    subtitle: "Proses mudah menemukan properti yang tepat untuk Anda.",
    steps: [
      {
        icon: "MessageCircle",
        title: "Konsultasi Gratis",
        description: "Konsultasi kebutuhanmu, kami bantu tentukan tipe properti yang sesuai.",
      },
      {
        icon: "Search",
        title: "Cari & Pilih",
        description: "Telusuri katalog terverifikasi, filter sesuai budget dan lokasi.",
      },
      {
        icon: "FileCheck",
        title: "Verifikasi Data",
        description: "Setiap listing melalui proses verifikasi dokumen dan legalitas.",
      },
      {
        icon: "Handshake",
        title: "Hubungi Agen",
        description: "Terhubung langsung dengan agen terpercaya untuk kunjungan & negosiasi.",
      },
    ] as const,
  },

  about: {
    heading: "Tentang TAP CATALOG",
    subtitle:
      "Katalog properti terlengkap untuk menemukan rumah, apartemen, tanah, dan ruko di seluruh Indonesia.",
    body: "TAP CATALOG adalah katalog properti modern yang mempertemukan pembeli, penyewa, dan agen terpercaya di seluruh Indonesia. Kami menyediakan ribuan listing terverifikasi — lengkap dengan foto, spesifikasi, dan lokasi — sehingga Anda dapat membuat keputusan properti dengan percaya diri.",
    image:
      "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=900&h=1100&fit=crop&auto=format&q=80",
  },

  contact: {
    email: "tigaanakpropetindo@gmail.com",
    address:
      "Alamat Kantor\nGedung Yayasan Purna Bakti (YARNATI)\nLt. 4 Ruang 407-408\nJl. Proklamasi No. 44\nPegangsaan, Menteng\nJakarta Pusat 10320",
    hours: "Senin – Jumat, 09.00 – 18.00 WIB",
  },

  social: {
    instagram: "#",
    whatsapp: "#",
    facebook: "#",
  },

  footer: {
    tagline: "Katalog properti terpercaya di seluruh Indonesia",
    explore: [
      { label: "Rumah", href: "/properti?type=rumah" },
      { label: "Apartemen", href: "/properti?type=apartemen" },
      { label: "Tanah", href: "/properti?type=tanah" },
      { label: "Ruko", href: "/properti?type=ruko" },
    ],
    company: [
      { label: "Tentang Kami", href: "/#about" },
      { label: "Hubungi Kami", href: "/#contact" },
      { label: "Kebijakan Privasi", href: "#" },
    ],
  },
} as const

export function brandTitle(title: string): string {
  return `${title} — ${BRAND.name}`
}
