"use client"

import { usePathname } from "next/navigation"
import { Sidebar } from "./sidebar"
import { Header } from "./header"

export function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  // No mostrar layout en login
  if (pathname === "/login") {
    return <>{children}</>
  }

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className="lg:pl-64">
        <Header />
        <main className="container mx-auto p-4 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}

