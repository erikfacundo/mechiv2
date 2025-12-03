"use client"

import { TailAdminLayout } from "./tailadmin-layout"

// Mantener compatibilidad con el nombre anterior
export function MainLayout({ children }: { children: React.ReactNode }) {
  return <TailAdminLayout>{children}</TailAdminLayout>
}

