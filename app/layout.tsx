import type { Metadata } from "next"
import { Mulish } from "next/font/google"
import "./globals.css"
import { Toaster } from "sonner"
import Navbar from "@/components/Navbar"
import ConditionalFooter from "@/components/ConditionalFooter"
import Providers from "@/components/Providers"
import { BRAND } from "@/lib/brand"

const mulish = Mulish({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  style: ["normal", "italic"],
  variable: "--font-mulish",
})

export const metadata: Metadata = {
  title: BRAND.pageTitle.home,
  description: BRAND.description,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className={mulish.variable}>
      <body className="min-h-screen bg-background antialiased overflow-x-hidden">
        <Providers>
          <Navbar />
          <main className="min-h-[60vh]">{children}</main>
          <ConditionalFooter />
        </Providers>
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: "var(--card)",
              color: "var(--foreground)",
              border: "1px solid var(--border)",
            },
          }}
        />
      </body>
    </html>
  )
}
