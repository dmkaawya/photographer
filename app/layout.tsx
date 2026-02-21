import type { Metadata, Viewport } from "next"
import { Playfair_Display, Inter } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { Toaster } from "sonner"
import "./globals.css"

const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair" })
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" })

export const metadata: Metadata = {
  title: "Sadeepa Photography | Luxury Photography Services",
  description:
    "Premium photography services for weddings, events, pre-shoots, and modeling. Capturing your most precious moments with artistic excellence.",
  keywords: ["photography", "wedding photography", "luxury photographer", "events", "modeling"],
}

export const viewport: Viewport = {
  themeColor: "#0a0a0a",
  width: "device-width",
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${playfair.variable} ${inter.variable} font-sans antialiased`}>
        {children}
        <Toaster
          theme="dark"
          toastOptions={{
            style: { background: "#111111", border: "1px solid #2a2520", color: "#f5f0e8" },
          }}
        />
        <Analytics />
      </body>
    </html>
  )
}
