"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { 
  LayoutDashboard, 
  Users, 
  Car, 
  Wrench,
  Menu,
  X,
  Folder,
  DollarSign,
  Receipt,
  FileText,
  Building2,
  Calendar,
  UserCog
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useState, useEffect } from "react"

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Clientes", href: "/clientes", icon: Users },
  { name: "Vehículos", href: "/vehiculos", icon: Car },
  { name: "Órdenes", href: "/ordenes", icon: Wrench },
  { name: "Turnos", href: "/turnos", icon: Calendar },
  { name: "Cobros", href: "/cobros", icon: DollarSign },
  { name: "Gastos", href: "/gastos", icon: Receipt },
  { name: "Proveedores", href: "/proveedores", icon: Building2 },
  { name: "Categorías", href: "/categorias", icon: Folder },
  { name: "Plantillas", href: "/plantillas-tareas", icon: FileText },
  { name: "Usuarios", href: "/usuarios", icon: UserCog },
]

export function Sidebar() {
  const pathname = usePathname()
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [username, setUsername] = useState<string | null>(null)

  useEffect(() => {
    if (typeof window !== "undefined") {
      setUsername(localStorage.getItem("username"))
    }
  }, [])

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="h-9 w-9 sm:h-10 sm:w-10"
        >
          {isMobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Mobile overlay */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-40 h-screen transition-transform",
          "bg-card border-r",
          "w-64",
          "lg:translate-x-0",
          "flex flex-col",
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex-1 px-3 py-4 overflow-y-auto">
          <div className="mb-8 mt-12 lg:mt-4">
            <h1 className="text-2xl font-bold text-primary px-3">
              Mechify
            </h1>
            <p className="text-sm text-muted-foreground px-3">v2.0</p>
          </div>
          <nav className="space-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsMobileOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  {item.name}
                </Link>
              )
            })}
          </nav>
        </div>
        {/* Usuario en la parte inferior del sidebar */}
        {username && (
          <div className="px-3 py-4 border-t">
            <p className="text-sm text-muted-foreground px-3">
              <span className="font-medium">Usuario:</span> {username}
            </p>
          </div>
        )}
      </aside>
    </>
  )
}

