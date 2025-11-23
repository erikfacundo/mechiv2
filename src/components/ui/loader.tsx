"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Check, X } from "lucide-react"
import Image from "next/image"
import { useTheme } from "next-themes"
import { Badge } from "@/components/ui/badge"

interface LoaderProps {
  /** Resultado de la operación: 'success' muestra tick verde, 'error' muestra cruz roja */
  result?: "success" | "error"
  /** Función que se ejecuta cuando termina la animación de 4 segundos */
  onFinish?: () => void
  /** Duración de la animación en milisegundos (por defecto 4000ms) */
  duration?: number
  /** Ruta personalizada del logo (opcional) */
  logoPath?: string
  /** Mensaje personalizado a mostrar (opcional) */
  message?: string
}

export function Loader({
  result,
  onFinish,
  duration = 4000,
  logoPath,
  message,
}: LoaderProps) {
  const [showResult, setShowResult] = useState(false)
  const { theme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Determinar qué logo usar según el tema
  const getDefaultLogo = () => {
    if (theme === "dark") {
      return "/logo/white-logo/white-logo.png"
    }
    return "/logo/black-logo/black-logo.png"
  }

  const finalLogoPath = logoPath || getDefaultLogo()

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    let finishTimer: NodeJS.Timeout | null = null
    
    // Timer para mostrar el resultado después de la duración especificada
    const timer = setTimeout(() => {
      setShowResult(true)
      
      // Ejecutar callback después de mostrar el resultado por 2.5 segundos
      // para que el usuario pueda ver el tick/X claramente
      finishTimer = setTimeout(() => {
        onFinish?.()
      }, 2500)
    }, duration)

    return () => {
      clearTimeout(timer)
      if (finishTimer) {
        clearTimeout(finishTimer)
      }
    }
  }, [duration, onFinish, result])

  if (!mounted) {
    return null
  }

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      {/* Overlay semitransparente */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
      />

      {/* Contenedor del loader */}
      <div className="relative z-10 flex flex-col items-center justify-center">
        {/* Logo siempre visible */}
        <div className="relative flex flex-col items-center justify-center gap-4">
          <motion.div 
            className="relative"
            animate={!showResult ? { 
              scale: [1, 1.1, 1],
            } : { scale: 1 }}
            transition={!showResult ? {
              scale: {
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut",
              },
            } : {}}
          >
            <div className="relative w-32 h-32 sm:w-40 sm:h-40">
              <Image
                src={finalLogoPath}
                alt="Logo"
                fill
                className="object-contain"
                priority
                unoptimized
              />
            </div>
            
            {/* Indicador de resultado (tick o X) - SOLO mostrar cuando showResult es true */}
            {showResult && result && (
              <motion.div
                key={`indicator-${result}`}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{
                  type: "spring",
                  stiffness: 300,
                  damping: 20,
                }}
                className={`absolute -bottom-2 -right-2 flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-full border-4 border-background shadow-lg z-50 ${
                  result === "success"
                    ? "bg-green-500"
                    : result === "error"
                    ? "bg-red-500"
                    : "bg-muted"
                }`}
                style={{ position: 'absolute' }}
              >
                {result === "success" ? (
                  <Check className="w-6 h-6 sm:w-7 sm:h-7 text-white" strokeWidth={3} />
                ) : result === "error" ? (
                  <X className="w-6 h-6 sm:w-7 sm:h-7 text-white" strokeWidth={3} />
                ) : null}
              </motion.div>
            )}
          </motion.div>

          {/* Badge de shadcn/ui con el estado - SOLO mostrar cuando showResult es true */}
          {showResult && result && (
            <motion.div
              key={`badge-${result}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Badge
                variant={
                  result === "success"
                    ? "default"
                    : result === "error"
                    ? "destructive"
                    : "secondary"
                }
                className="text-sm px-4 py-1"
              >
                {result === "success"
                  ? "Éxito"
                  : result === "error"
                  ? "Error"
                  : "Completado"}
              </Badge>
            </motion.div>
          )}

          {/* Mensaje de carga o personalizado */}
          {!showResult ? (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-sm sm:text-base text-muted-foreground text-center"
            >
              Cargando...
            </motion.p>
          ) : message ? (
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-sm sm:text-base font-medium text-foreground text-center max-w-md"
            >
              {message}
            </motion.p>
          ) : null}
        </div>
      </div>
    </div>
  )
}

