import type { Metadata } from "next"
import { BRAND } from "@/lib/brand"

export const metadata: Metadata = {
  title: BRAND.pageTitle.login,
  description: BRAND.loginDescription,
}

export default function MasukLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
