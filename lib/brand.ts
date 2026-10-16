export const BRAND = {
  name: "TRIHUNI",

  // BrandMark draws the real TRIHUNI logo as inline SVG. `wordmark` is the
  // plain-text form; `monogram` only feeds the favicon (app/icon.svg and the
  // PNGs rendered from it).
  logo: { wordmark: "TRIHUNI", monogram: "T" },

  fullName: "TRIHUNI — Katalog Properti Indonesia",

  tagline: "Katalog Properti #1 Indonesia",

  description: "Katalog properti terlengkap di Indonesia — rumah, apartemen, tanah, dan ruko",

  pageTitle: {
    home: "TRIHUNI – Katalog Properti Indonesia",
    catalog: "Katalog Properti — TRIHUNI",
    map: "Peta Properti — TRIHUNI",
    login: "Masuk — TRIHUNI",
    forgotPassword: "Lupa Password — TRIHUNI",
    resetPassword: "Atur Ulang Password — TRIHUNI",
    register: "Daftar — TRIHUNI",
    propertyNotFound: "Properti Tidak Ditemukan — TRIHUNI",
    catalogHeading: "Katalog Properti",
  },

  pageDescription: {
    home: "Temukan rumah, apartemen, tanah, dan ruko terbaik di seluruh Indonesia",
    catalog: "Telusuri katalog properti terverifikasi di seluruh Indonesia",
    register: "Buat akun TRIHUNI gratis",
    login: "Masuk ke akun TRIHUNI kamu",
  },

  loginDescription: "Masuk ke akun TRIHUNI kamu",
  registerDescription: "Buat akun TRIHUNI gratis",

  // Homepage search hero: a rounded banner photograph with the search form on it.
  searchHero: {
    headline: "Temukan properti impianmu di seluruh Indonesia",
    subtitle: "Rumah, apartemen, tanah, dan ruko — dijual dan disewakan langsung oleh agen terpercaya.",
    placeholder: "Cari kota, area, atau nama properti",
    cta: "Cari Sekarang",
    image:
      "https://images.unsplash.com/photo-1646928229117-08e84cde1692?auto=format&fit=crop&w=2000&q=80",
    imageAlt: "Rumah di tengah hutan tropis",
  },

  listingRail: {
    heading: "Pilihan Untukmu",
    subheading: "Listing terbaru dari agen kami",
  },

  budgetRail: {
    heading: "Cari sesuai budgetmu",
  },

  benefits: {
    heading: "Keuntungan bersama TRIHUNI",
    subtitle: "Semua yang kamu butuhkan untuk menemukan properti yang tepat.",
    items: [
      { icon: "FileCheck", title: "Listing terverifikasi", description: "Setiap listing melalui verifikasi dokumen dan legalitas." },
      { icon: "Users", title: "Agen terpercaya", description: "Terhubung langsung dengan agen yang menangani setiap listing." },
      { icon: "MessageCircle", title: "Tanya lewat WhatsApp", description: "Hubungi agen langsung, tanpa formulir panjang." },
      { icon: "Calculator", title: "Simulasi KPR", description: "Hitung cicilan bulanan di setiap listing yang dijual." },
      { icon: "Map", title: "Cari lewat peta", description: "Lihat sebaran listing dan pilih lokasi yang pas." },
      { icon: "SlidersHorizontal", title: "Filter lengkap", description: "Saring berdasarkan tipe, kota, harga, dan kamar tidur." },
      { icon: "Heart", title: "Simpan favorit", description: "Tandai listing incaran dan buka lagi kapan saja." },
      { icon: "KeyRound", title: "Jual dan sewa", description: "Rumah, apartemen, tanah, dan ruko — untuk dibeli atau disewa." },
    ],
  },

  contactCta: {
    heading: "Butuh bantuan cari properti?",
    body: "Agen kami mengenal area dan tipe properti yang kamu cari. Ceritakan kebutuhanmu, kami bantu carikan.",
    agentsCta: "Lihat Agen Kami",
    whatsappCta: "Chat WhatsApp",
  },

  popularCities: {
    heading: "Properti per kota",
    subtitle: "Jelajahi listing aktif di kota-kota pilihan.",
    cities: [
      { name: "Jakarta", image: "https://images.unsplash.com/photo-1555899434-94d1368aa7af?w=800&h=600&fit=crop&auto=format" },
      { name: "Bandung", image: "https://images.unsplash.com/photo-1707993467310-a5b2bb858d68?w=800&h=600&fit=crop&auto=format" },
      { name: "Surabaya", image: "https://images.unsplash.com/photo-1698139603356-d8c63b9aacce?w=800&h=600&fit=crop&auto=format" },
      { name: "Yogyakarta", image: "https://images.unsplash.com/photo-1722444924699-391078e83ad6?w=800&h=600&fit=crop&auto=format" },
      { name: "Bali", image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&h=600&fit=crop&auto=format" },
      { name: "Semarang", image: "https://images.unsplash.com/photo-1657594873796-4a121883192a?w=800&h=600&fit=crop&auto=format" },
    ],
  },

  contact: {
    email: "office@tigaanakpropertindo.com",
    website: "tigaanakpropertindo.com",

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
      { label: "Hubungi Kami", href: "/#contact" },
      { label: "Kebijakan Privasi", href: "#" },
    ],
  },
} as const

export function brandTitle(title: string): string {
  return `${title} — ${BRAND.name}`
}
