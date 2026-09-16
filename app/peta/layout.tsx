import type { Metadata } from "next"
import { BRAND } from "@/lib/brand"

export const metadata: Metadata = {
  title: BRAND.pageTitle.map,
  description: "Lihat lokasi properti di peta interaktif",
}

export default function PetaLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
