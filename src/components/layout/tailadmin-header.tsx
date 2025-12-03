"use client"

import { Moon, Sun, LogOut, Search, Menu } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"

// Función para generar breadcrumbs desde la ruta
function getBreadcrumbs(pathname: string) {
  const paths = pathname.split('/').filter(Boolean)
  const breadcrumbs: Array<{ name: string; href: string; current?: boolean }> = []
  
  // Si estamos en dashboard, solo mostrar Dashboard
  if (paths.length === 0 || (paths.length === 1 && paths[0] === 'dashboard')) {
    return [{ name: 'Dashboard', href: '/dashboard', current: true }]
  }
  
  // Agregar Inicio solo si no estamos en dashboard
  breadcrumbs.push({ name: 'Inicio', href: '/dashboard' })
  
  const routeNames: Record<string, string> = {
    'dashboard': 'Dashboard',
    'clientes': 'Clientes',
    'vehiculos': 'Vehículos',
    'ordenes': 'Órdenes',
    'turnos': 'Turnos',
    'cobros': 'Cobros',
    'gastos': 'Gastos',
    'proveedores': 'Proveedores',
    'categorias': 'Categorías',
    'plantillas-tareas': 'Plantillas',
    'usuarios': 'Usuarios',
    'nuevo': 'Nuevo',
    'editar': 'Editar',
  }
  
  // Función para detectar si un path es un ID (Firebase IDs suelen ser largos y alfanuméricos)
  const isId = (path: string) => {
    return path.length > 15 && /^[a-zA-Z0-9]+$/.test(path)
  }
  
  let currentPath = ''
  let lastValidPath = '/dashboard'
  
  paths.forEach((path, index) => {
    const isLast = index === paths.length - 1
    
    // Si es un ID, omitirlo de los breadcrumbs pero mantener el path para el siguiente
    if (isId(path)) {
      currentPath += `/${path}`
      // No agregamos nada al breadcrumb, solo actualizamos el path
      return
    }
    
    currentPath += `/${path}`
    
    // Si es una ruta conocida, agregarla
    if (routeNames[path]) {
      breadcrumbs.push({ 
        name: routeNames[path], 
        href: currentPath, 
        current: isLast 
      })
      lastValidPath = currentPath
    } else {
      // Para otros casos, capitalizar la primera letra
      const name = path.charAt(0).toUpperCase() + path.slice(1)
      breadcrumbs.push({ 
        name, 
        href: currentPath, 
        current: isLast 
      })
      lastValidPath = currentPath
    }
  })
  
  return breadcrumbs
}

export function TailAdminHeader() {
  const { theme, setTheme } = useTheme()
  const router = useRouter()
  const pathname = usePathname()
  const { toast } = useToast()
  const [mounted, setMounted] = useState(false)
  const [username, setUsername] = useState<string | null>(null)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const breadcrumbs = getBreadcrumbs(pathname)

  const handleMobileMenuToggle = () => {
    const newState = !isMobileMenuOpen
    setIsMobileMenuOpen(newState)
    // Disparar evento para que el sidebar se actualice
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("mobileMenuToggle", { detail: newState }))
    }
  }

  useEffect(() => {
    setMounted(true)
    if (typeof window !== "undefined") {
      setUsername(localStorage.getItem("username"))
      
      // Escuchar eventos del sidebar para sincronizar estado
      const handleMobileMenuToggle = (event: CustomEvent) => {
        setIsMobileMenuOpen(event.detail)
      }
      
      window.addEventListener("mobileMenuToggle", handleMobileMenuToggle as EventListener)
      return () => {
        window.removeEventListener("mobileMenuToggle", handleMobileMenuToggle as EventListener)
      }
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated")
    localStorage.removeItem("username")
    toast({
      title: "Sesión cerrada",
      description: "Has cerrado sesión correctamente.",
      variant: "success",
    })
    router.push("/login")
  }

  if (!mounted || pathname === "/login") {
    return null
  }

  return (
    <header className="sticky top-0 z-30 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center gap-4 px-4 sm:px-6 lg:px-8">
        {/* Mobile menu button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={handleMobileMenuToggle}
          className="lg:hidden h-9 w-9 flex-shrink-0"
          aria-label="Toggle menu"
        >
          <Menu className="h-5 w-5" />
        </Button>

        {/* Breadcrumbs */}
        <nav className="hidden md:flex items-center gap-2 flex-1 min-w-0">
          {breadcrumbs.map((crumb, index) => (
            <div key={`${crumb.href}-${index}`} className="flex items-center gap-2">
              {index > 0 && (
                <span className="text-muted-foreground">/</span>
              )}
              {crumb.current ? (
                <span className="text-sm font-medium text-foreground truncate">
                  {crumb.name}
                </span>
              ) : (
                <Link
                  href={crumb.href}
                  className="text-sm text-muted-foreground hover:text-foreground truncate transition-colors"
                >
                  {crumb.name}
                </Link>
              )}
            </div>
          ))}
        </nav>

        {/* Mobile title */}
        <div className="md:hidden flex-1">
          <h1 className="text-base font-semibold text-foreground truncate">
            {breadcrumbs[breadcrumbs.length - 1]?.name || 'Mechify'}
          </h1>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Search button - mobile */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden h-9 w-9"
            aria-label="Buscar"
          >
            <Search className="h-4 w-4" />
          </Button>

          {/* Search - desktop */}
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-secondary border border-border min-w-[200px] max-w-xs transition-colors hover:border-border/80">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar..."
              className="flex-1 bg-transparent border-0 outline-none text-sm text-foreground placeholder:text-muted-foreground"
            />
          </div>

          {/* Theme toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="h-9 w-9 flex-shrink-0"
            aria-label="Toggle theme"
          >
            <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          </Button>

          {/* Logout */}
          <Button
            variant="ghost"
            size="icon"
            onClick={handleLogout}
            className="h-9 w-9 flex-shrink-0 md:h-auto md:w-auto md:px-3 md:gap-2"
            aria-label="Salir"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden md:inline">Salir</span>
          </Button>
        </div>
      </div>
    </header>
  )
}

