"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { 
  LayoutDashboard, 
  Users, 
  Car, 
  Wrench,
  Folder,
  DollarSign,
  Receipt,
  FileText,
  Building2,
  Calendar,
  UserCog,
  ChevronRight,
  Menu,
  X
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useState, useEffect } from "react"
import { useTheme } from "next-themes"

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

export function TailAdminSidebar() {
  const pathname = usePathname()
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [username, setUsername] = useState<string | null>(null)
  const { theme } = useTheme()

  useEffect(() => {
    if (typeof window !== "undefined") {
      setUsername(localStorage.getItem("username"))
      // Colapsar sidebar en móvil por defecto
      const isMobile = window.innerWidth < 1024
      const savedState = localStorage.getItem("sidebarCollapsed")
      setIsCollapsed(isMobile || savedState === "true")
      
      // Guardar estado en localStorage
      const handleResize = () => {
        if (window.innerWidth >= 1024) {
          // En desktop, usar preferencia guardada
          const saved = localStorage.getItem("sidebarCollapsed") === "true"
          setIsCollapsed(saved)
        } else {
          // En móvil, siempre colapsado
          setIsCollapsed(true)
        }
      }
      
      // Escuchar eventos del header para toggle del menú móvil
      const handleMobileMenuToggle = (event: CustomEvent) => {
        setIsMobileOpen(event.detail)
      }
      
      window.addEventListener("resize", handleResize)
      window.addEventListener("mobileMenuToggle", handleMobileMenuToggle as EventListener)
      return () => {
        window.removeEventListener("resize", handleResize)
        window.removeEventListener("mobileMenuToggle", handleMobileMenuToggle as EventListener)
      }
    }
  }, [])

  const handleToggleCollapse = () => {
    const newState = !isCollapsed
    setIsCollapsed(newState)
    if (typeof window !== "undefined") {
      localStorage.setItem("sidebarCollapsed", String(newState))
      // Disparar evento para que otros componentes se actualicen
      window.dispatchEvent(new Event("sidebarToggle"))
    }
  }

  const handleMobileMenuClose = () => {
    setIsMobileOpen(false)
    // Notificar al header
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("mobileMenuToggle", { detail: false }))
    }
  }

  return (
    <>
      {/* Mobile menu button - se renderiza en el header */}

      {/* Mobile overlay */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={handleMobileMenuClose}
        />
      )}

      {/* Sidebar Desktop */}
      <aside
        className={cn(
          "h-screen transition-all duration-300 ease-in-out",
          "bg-card border-r border-border",
          "flex flex-col",
          "hidden lg:flex",
          "flex-shrink-0"
        )}
        style={{
          width: isCollapsed ? "5rem" : "18rem"
        }}
      >
        {/* Logo/Brand */}
        <div className={cn(
          "flex items-center justify-between px-4 py-5 border-b border-border",
          isCollapsed && "justify-center px-2"
        )}>
          {!isCollapsed && (
            <div>
              <h1 className="text-lg font-semibold text-foreground">
                Mechify
              </h1>
              <p className="text-xs text-muted-foreground mt-0.5">v2.0</p>
            </div>
          )}
          {isCollapsed && (
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shadow-sm">
              <Wrench className="h-4 w-4 text-primary-foreground" />
            </div>
          )}
          {/* Collapse button - solo en desktop */}
          <button
            onClick={handleToggleCollapse}
            className="hidden lg:flex p-1.5 rounded-lg hover:bg-accent text-muted-foreground transition-colors"
            aria-label="Toggle sidebar"
          >
            <ChevronRight className={cn(
              "h-4 w-4 transition-transform duration-200",
              isCollapsed && "rotate-180"
            )} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-2 py-3 overflow-y-auto scrollbar-thin">
          <ul className="space-y-0.5">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    onClick={handleMobileMenuClose}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                      "group relative",
                      isActive
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                      isCollapsed && "justify-center px-2"
                    )}
                  >
                    <item.icon className={cn(
                      "h-4 w-4 flex-shrink-0 transition-colors",
                      isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-foreground"
                    )} />
                    {!isCollapsed && (
                      <span className="flex-1">{item.name}</span>
                    )}
                    {isCollapsed && (
                      <span className="absolute left-full ml-2 px-2.5 py-1.5 text-xs font-medium text-primary-foreground bg-primary rounded-md opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50 shadow-lg">
                        {item.name}
                      </span>
                    )}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        {/* User info - solo cuando no está colapsado */}
        {username && !isCollapsed && (
          <div className="px-4 py-3 border-t border-border">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <UserCog className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {username}
                </p>
                <p className="text-xs text-muted-foreground">
                  Usuario activo
                </p>
              </div>
            </div>
          </div>
        )}
      </aside>

      {/* Sidebar Mobile */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-40 h-screen transition-transform duration-300 ease-in-out",
          "bg-card border-r border-border",
          "flex flex-col shadow-xl w-72",
          "lg:hidden",
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex items-center justify-between px-4 py-5 border-b border-border">
          <div>
            <h1 className="text-lg font-semibold text-foreground">
              Mechify
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">v2.0</p>
          </div>
          <button
            onClick={() => setIsMobileOpen(false)}
            className="p-1.5 rounded-lg hover:bg-accent text-muted-foreground transition-colors"
            aria-label="Cerrar menú"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <nav className="flex-1 px-2 py-3 overflow-y-auto scrollbar-thin">
          <ul className="space-y-0.5">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    onClick={handleMobileMenuClose}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                      isActive
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                    )}
                  >
                    <item.icon className={cn(
                      "h-4 w-4 flex-shrink-0",
                      isActive ? "text-primary-foreground" : "text-muted-foreground"
                    )} />
                    <span className="flex-1">{item.name}</span>
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>
        {username && (
          <div className="px-4 py-3 border-t border-border">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <UserCog className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {username}
                </p>
                <p className="text-xs text-muted-foreground">
                  Usuario activo
                </p>
              </div>
            </div>
          </div>
        )}
      </aside>
    </>
  )
}

