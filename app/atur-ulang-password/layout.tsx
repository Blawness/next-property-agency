import type { Metadata } from "next"
import { BRAND } from "@/lib/brand"

export const metadata: Metadata = {
  title: BRAND.pageTitle.resetPassword,
  description: `Buat password baru untuk akun ${BRAND.name}.`,
  // The URL carries a one-time token; it has no business in a search index.
  robots: { index: false, follow: false },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
