import type React from "react"
import type { Metadata } from "next"
import { Inter, Lato, Nunito } from "next/font/google"
import "./globals.css"
import { Suspense } from "react"
import { AuthProvider } from "@/contexts/auth-context"
import { Toaster } from "@/components/ui/toaster"
import { LoadingSpinnerSuspense } from "@/components/Shared/ui/loading-suspense"

const inter = Inter({ subsets: ["latin"] })

const lato = Lato({
  subsets: ["latin"],
  weight: ["400", "700"],
})

const nunito = Nunito({
  subsets: ["latin"],
  weight: ["500", "800"],
})

export const metadata: Metadata = {
  title: "DentaDesk Pro",
  description: "Système de gestion moderne pour votre cabinet dentaire",
  generator: "DensEmpireTechnology",
  applicationName: "DentaDesk Pro",
  authors: [{ name: "Dens Empire Technology", url: "https://github.com/kemayo278" }],
  keywords: [
    "DentaDesk",
    "DentaDesk Pro",
    "gestion cabinet dentaire",
    "logiciel dentaire",
    "CRM dentaire",
    "rendez-vous dentiste",
    "facturation dentaire",
    "dossier patient",
    "système de gestion dentaire",
    "dental practice management",
  ],
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <body className={`${nunito.className} antialiased`}>
        {/* <AuthProvider> */}
          <Suspense fallback={<LoadingSpinnerSuspense />}>
            {children}
          </Suspense>
          <Toaster />
        {/* </AuthProvider> */}
      </body>
    </html>
  )
}
