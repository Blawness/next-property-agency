import type { Metadata } from "next"
import { BRAND } from "@/lib/brand"

export const metadata: Metadata = {
  title: BRAND.pageTitle.register,
  description: BRAND.registerDescription,
}

export default function DaftarLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
