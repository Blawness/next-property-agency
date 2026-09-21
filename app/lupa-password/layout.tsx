import type { Metadata } from "next"
import { BRAND } from "@/lib/brand"

export const metadata: Metadata = {
  title: BRAND.pageTitle.forgotPassword,
  description: `Minta tautan untuk mengatur ulang password akun ${BRAND.name}.`,
  robots: { index: false },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
