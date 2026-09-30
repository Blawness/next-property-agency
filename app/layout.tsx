import type { Metadata } from "next"
import { Cormorant_Garamond, Pinyon_Script, Plus_Jakarta_Sans } from "next/font/google"
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

// Cormorant carries the homepage's display lines — a high-contrast serif set
// light and large, which is what makes the landing read as a residence
// brochure rather than a catalogue. The rest of the app never uses it.
const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
})

// Pinyon Script sets the one accent word under the hero headline. Only the
// homepage uses it, so it is not preloaded: other pages never fetch the file.
const pinyon = Pinyon_Script({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-pinyon",
  preload: false,
})

export const metadata: Metadata = {
  title: BRAND.pageTitle.home,
  description: BRAND.description,
}

// suppressHydrationWarning: IntroLoader's parse-time script adds intro-* classes
// to <html> before React hydrates, so its className differs from the server's
// on purpose. It only silences that one element's own attributes.
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" suppressHydrationWarning className={`${jakarta.variable} ${cormorant.variable} ${pinyon.variable}`}>
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
