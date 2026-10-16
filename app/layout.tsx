import type { Metadata } from "next"
import { Plus_Jakarta_Sans } from "next/font/google"
import "./globals.css"
import { Toaster } from "sonner"
import Navbar from "@/components/Navbar"
import ConditionalFooter from "@/components/ConditionalFooter"
import Providers from "@/components/Providers"
import { BRAND } from "@/lib/brand"

// Plus Jakarta Sans carries both headings and body copy: 400/500 for text and
// UI, 600 for buttons and card titles, 700 for headings. Nothing lighter than
// 400 — its thin weights turn brittle at small sizes on cheap phone screens.
const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-jakarta",
})

export const metadata: Metadata = {
  title: BRAND.pageTitle.home,
  description: BRAND.description,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className={jakarta.variable}>
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
