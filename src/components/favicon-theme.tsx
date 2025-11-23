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
    if (!mounted) return

    // Esperar un poco para que el tema se resuelva
    const updateFavicon = () => {
      // Usar resolvedTheme para obtener el tema real (incluye 'system')
      const currentTheme = resolvedTheme || theme || "dark"
      const isDark = currentTheme === "dark"

      // Seleccionar el favicon según el tema
      const faviconPath = isDark
        ? "/logo/white-logo/favicon.ico"
        : "/logo/black-logo/favicon.ico"

      // Buscar y actualizar todos los links de favicon
      const faviconLinks = document.querySelectorAll("link[rel*='icon']")
      faviconLinks.forEach((link) => {
        const linkElement = link as HTMLLinkElement
        if (linkElement.rel === "icon" || linkElement.rel === "shortcut icon") {
          linkElement.href = faviconPath
        }
      })

      // Si no existe ningún favicon, crear uno
      if (faviconLinks.length === 0) {
        const newLink = document.createElement("link")
        newLink.rel = "icon"
        newLink.href = faviconPath
        document.head.appendChild(newLink)
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
    }

      // Ejecutar inmediatamente y también después de un pequeño delay
    updateFavicon()
    const timeout = setTimeout(() => {
      updateFavicon()
      if (process.env.NODE_ENV === 'development') {
        console.log('Favicon actualizado:', resolvedTheme || theme)
      }
    }, 100)

    return () => clearTimeout(timeout)
  }, [theme, resolvedTheme, mounted])

  return null
}

