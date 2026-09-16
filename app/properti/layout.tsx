import type { Metadata } from "next"
import { BRAND } from "@/lib/brand"

export const metadata: Metadata = {
  title: BRAND.pageTitle.catalog,
  description: BRAND.pageDescription.catalog,
}

export default function PropertiLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
