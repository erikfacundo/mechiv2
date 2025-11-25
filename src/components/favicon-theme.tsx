"use client"

import { useEffect, useState } from "react"
import { useTheme } from "next-themes"

/**
 * Componente que cambia el favicon dinámicamente según el tema actual
 * Usa el logo blanco para modo oscuro y el logo negro para modo claro
 */
export function FaviconTheme() {
  const { theme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted || typeof document === 'undefined') return

    // Esperar un poco para que el tema se resuelva
    const updateFavicon = () => {
      try {
        // Usar resolvedTheme para obtener el tema real (incluye 'system')
        const currentTheme = resolvedTheme || theme || "dark"
        const isDark = currentTheme === "dark"

        // Seleccionar el favicon según el tema
        const faviconPath = isDark
          ? "/logo/white-logo/favicon.ico"
          : "/logo/black-logo/favicon.ico"

        // Buscar y actualizar todos los links de favicon
        const faviconLinks = document.querySelectorAll("link[rel*='icon']")
        let hasMainFavicon = false
        
        faviconLinks.forEach((link) => {
          const linkElement = link as HTMLLinkElement
          if (linkElement.rel === "icon" || linkElement.rel === "shortcut icon") {
            linkElement.href = faviconPath
            hasMainFavicon = true
          }
        })

        // Si no existe ningún favicon, crear uno
        if (!hasMainFavicon) {
          const newLink = document.createElement("link")
          newLink.rel = "icon"
          newLink.type = "image/x-icon"
          newLink.href = faviconPath
          document.head.appendChild(newLink)
        }
        
        // También crear/actualizar el favicon.ico por defecto para evitar 404
        // Actualizar el link con rel="shortcut icon" o crear uno nuevo
        const defaultFavicon = document.querySelector("link[rel='shortcut icon']") as HTMLLinkElement
        if (defaultFavicon) {
          defaultFavicon.href = faviconPath
        } else {
          const newDefaultFavicon = document.createElement("link")
          newDefaultFavicon.rel = "shortcut icon"
          newDefaultFavicon.href = faviconPath
          document.head.appendChild(newDefaultFavicon)
        }
        
        // También actualizar cualquier link con href="/favicon.ico"
        const rootFavicon = document.querySelector("link[href='/favicon.ico']") as HTMLLinkElement
        if (rootFavicon) {
          rootFavicon.href = faviconPath
        }

        // Actualizar apple-touch-icon
        const appleIcon = document.querySelector("link[rel='apple-touch-icon']") as HTMLLinkElement
        const appleIconPath = isDark
          ? "/logo/white-logo/apple-touch-icon.png"
          : "/logo/black-logo/apple-touch-icon.png"
        
        if (appleIcon) {
          appleIcon.href = appleIconPath
        } else {
          const newAppleIcon = document.createElement("link")
          newAppleIcon.rel = "apple-touch-icon"
          newAppleIcon.href = appleIconPath
          document.head.appendChild(newAppleIcon)
        }
      } catch (error) {
        // Silenciar errores de favicon en producción
        // En desarrollo, Next.js inyecta NODE_ENV automáticamente
        if (process.env.NODE_ENV === 'development') {
          console.warn('Error actualizando favicon:', error)
        }
      }
    }

    // Ejecutar inmediatamente y también después de un pequeño delay
    updateFavicon()
    const timeout = setTimeout(() => {
      updateFavicon()
    }, 100)

    return () => clearTimeout(timeout)
  }, [theme, resolvedTheme, mounted])

  return null
}

