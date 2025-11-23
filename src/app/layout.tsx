import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { MainLayout } from "@/components/layout/main-layout"
import { Toaster } from "@/components/ui/toaster"
import { AuthGuard } from "@/components/auth/auth-guard"
import { FaviconTheme } from "@/components/favicon-theme"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Mechify v2.0 - Gestión de Taller Automotriz",
  description: "Sistema de gestión integral para talleres automotrices",
  icons: {
    icon: [
      { url: "/logo/black-logo/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/logo/black-logo/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/logo/black-logo/favicon.ico", sizes: "any" },
    ],
    apple: [
      { url: "/logo/black-logo/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    other: [
      { rel: "android-chrome-192x192", url: "/logo/black-logo/android-chrome-192x192.png" },
      { rel: "android-chrome-512x512", url: "/logo/black-logo/android-chrome-512x512.png" },
    ],
  },
  manifest: "/logo/black-logo/site.webmanifest",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <FaviconTheme />
          <MainLayout>
            <AuthGuard>
              {children}
            </AuthGuard>
          </MainLayout>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}

