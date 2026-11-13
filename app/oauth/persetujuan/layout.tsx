import type { Metadata } from "next"
import { BRAND } from "@/lib/brand"

export const metadata: Metadata = {
  title: BRAND.pageTitle.oauthConsent,
  description: `Izinkan aplikasi memakai akun ${BRAND.name} kamu.`,
  robots: { index: false },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
