"use client"

import { usePathname } from "next/navigation"
import { TailAdminSidebar } from "./tailadmin-sidebar"
import { TailAdminHeader } from "./tailadmin-header"

export function TailAdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  // No mostrar layout en login
  if (pathname === "/login") {
    return <>{children}</>
  }

  return (
    <div className="min-h-screen bg-background flex">
      <TailAdminSidebar />
      {/* Contenido principal */}
      <div className="flex-1 flex flex-col min-w-0">
        <TailAdminHeader />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto">
          <div className="max-w-7xl mx-auto w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}

