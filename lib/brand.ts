export const BRAND = {
  name: "PROPERTI NUSA",

  // BrandMark renders the name as two weights; keep these in sync with `name`.
  wordmark: { lead: "PROPERTI", trail: "NUSA" },

  fullName: "PROPERTI NUSA — Katalog Properti Indonesia",

  tagline: "Katalog Properti #1 Indonesia",

  description: "Katalog properti terlengkap di Indonesia — rumah, apartemen, tanah, dan ruko",

  heroImageAlt: "PROPERTI NUSA — Katalog Properti Indonesia",

  pageTitle: {
    home: "PROPERTI NUSA – Katalog Properti Indonesia",
    catalog: "Katalog Properti — PROPERTI NUSA",
    map: "Peta Properti — PROPERTI NUSA",
    login: "Masuk — PROPERTI NUSA",
    forgotPassword: "Lupa Password — PROPERTI NUSA",
    resetPassword: "Atur Ulang Password — PROPERTI NUSA",
    register: "Daftar — PROPERTI NUSA",
    propertyNotFound: "Properti Tidak Ditemukan — PROPERTI NUSA",
    catalogHeading: "Katalog Properti",
  },

  pageDescription: {
    home: "Temukan rumah, apartemen, tanah, dan ruko terbaik di seluruh Indonesia",
    catalog: "Telusuri katalog properti terverifikasi di seluruh Indonesia",
    register: "Buat akun PROPERTI NUSA gratis",
    login: "Masuk ke akun PROPERTI NUSA kamu",
  },

  loginDescription: "Masuk ke akun PROPERTI NUSA kamu",
  registerDescription: "Buat akun PROPERTI NUSA gratis",

  // Homepage hero. The headline is two lines — the second is set in italic —
  // so keep it as a pair rather than one string with a break in it.
  hero: {
    eyebrow: "Properti Pilihan di Seluruh Indonesia",
    headline: { lead: "Ruang untuk hidup,", trail: "dirancang untuk dikenang." },
    subtitle:
      "Rumah, apartemen, tanah, dan ruko terverifikasi — dikurasi oleh agen yang mengenal setiap alamatnya.",
    primaryCta: "Jelajahi Koleksi",
    secondaryCta: "Jadwalkan Konsultasi",
    imageAlt: "Siluet kota saat senja",
    // Swap the footage here: AV1 first, VP9 as the fallback, and a still that
    // shows while the video loads and for visitors who prefer reduced motion.
    // Frame it so the lower third is calm — the headline sits there.
    video: [
      { src: "/hero.av1.mp4", type: 'video/mp4; codecs="av01.0.05M.08"' },
      { src: "/hero.webm", type: 'video/webm; codecs="vp9"' },
    ],
    poster:
      "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=2000&q=80",
  },

  // Full-bleed quote band between the process and the collection.
  manifesto: {
    quote: "Properti terbaik tidak dijual dengan tergesa. Ia ditemukan, diperiksa, lalu dipilih dengan tenang.",
    attribution: "Prinsip kerja PROPERTI NUSA",
    // Chosen, not pulled from a listing: agent photos vary too much to carry a
    // full-bleed band. Swap for the agency's own photography when there is some.
    image:
      "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=2000&auto=format&fit=crop&q=80",
  },

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
    heading: "Tentang PROPERTI NUSA",
    subtitle:
      "Katalog properti terlengkap untuk menemukan rumah, apartemen, tanah, dan ruko di seluruh Indonesia.",
    body: "PROPERTI NUSA adalah katalog properti modern yang mempertemukan pembeli, penyewa, dan agen terpercaya di seluruh Indonesia. Kami menyediakan ribuan listing terverifikasi — lengkap dengan foto, spesifikasi, dan lokasi — sehingga Anda dapat membuat keputusan properti dengan percaya diri.",
    statement: "Setiap alamat punya cerita. Tugas kami memastikan ceritanya benar.",
    image:
      "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=900&h=1100&fit=crop&auto=format&q=80",
  },

  contactSection: {
    heading: "Mari berbincang.",
    body: "Ceritakan properti yang Anda cari — kami balas dengan daftar pilihan dalam satu hari kerja.",
  },

  contact: {
    email: "tigaanakpropetindo@gmail.com",

    // Fallback for the WhatsApp enquiry when a listing's agent has no number
    // on file. Left blank on purpose — an empty value hides the button rather
    // than pointing buyers at a number nobody answers. Fill it to switch the
    // office fallback on.
    whatsapp: "",

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
    // The large serif line that opens the footer, with its call to action.
    closing: { lead: "Temukan alamat", trail: "berikutnya.", cta: "Lihat semua properti" },
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
