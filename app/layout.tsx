import type { Metadata } from "next"
import { Archivo, Cormorant_Garamond, Inter } from "next/font/google"
import "./globals.css"
import { Toaster } from "sonner"
import Navbar from "@/components/Navbar"
import ConditionalFooter from "@/components/ConditionalFooter"
import Providers from "@/components/Providers"
import { BRAND } from "@/lib/brand"

// Archivo carries the headings — a grotesk with enough weight at 700/800 to
// hold the editorial layout together. Inter stays out of the way in body copy.
const archivo = Archivo({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  variable: "--font-archivo",
})

// Cormorant carries the homepage's display lines — a high-contrast serif set
// light and large, which is what makes the landing read as a residence
// brochure rather than a catalogue. The rest of the app never uses it.
const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
})

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-inter",
})

export const metadata: Metadata = {
  title: BRAND.pageTitle.home,
  description: BRAND.description,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className={`${archivo.variable} ${cormorant.variable} ${inter.variable}`}>
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
