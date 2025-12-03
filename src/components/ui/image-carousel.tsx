"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, X } from "lucide-react"
import Image from "next/image"
import { FotoVehiculo, FotoOrden } from "@/types"
import { isR2Url } from "@/lib/r2-storage"

interface ImageCarouselProps {
  fotos: (FotoVehiculo | FotoOrden)[]
  isOpen: boolean
  onClose: () => void
  initialIndex?: number
  title?: string
}

export function ImageCarousel({ 
  fotos, 
  isOpen, 
  onClose, 
  initialIndex = 0,
  title = "Galería de fotos"
}: ImageCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex)

  if (fotos.length === 0) return null

  const currentFoto = fotos[currentIndex]

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? fotos.length - 1 : prev - 1))
  }

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === fotos.length - 1 ? 0 : prev + 1))
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') handlePrevious()
    if (e.key === 'ArrowRight') handleNext()
    if (e.key === 'Escape') onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className="max-w-4xl w-full p-0 gap-0"
        onKeyDown={handleKeyDown}
      >
        <DialogHeader className="px-6 py-4 border-b">
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <div className="relative bg-black">
          {/* Imagen principal */}
          <div className="relative aspect-video w-full">
            <Image
              src={currentFoto.url || currentFoto.dataUrl || ''}
              alt={`Foto ${currentIndex + 1}`}
              fill
              className="object-contain"
              priority
              unoptimized={!!currentFoto.url && isR2Url(currentFoto.url)}
            />
          </div>

          {/* Botones de navegación */}
          {fotos.length > 1 && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white"
                onClick={handlePrevious}
              >
                <ChevronLeft className="h-6 w-6" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white"
                onClick={handleNext}
              >
                <ChevronRight className="h-6 w-6" />
              </Button>
            </>
          )}

          {/* Contador */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/70 text-white px-3 py-1 rounded-full text-sm">
            {currentIndex + 1} / {fotos.length}
          </div>
        </div>

        {/* Información de la foto */}
        <div className="px-6 py-4 bg-background border-t">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">
                {new Date(currentFoto.fechaHora).toLocaleString('es-AR', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit'
                })}
              </p>
              {'tipo' in currentFoto && (
                <p className="text-xs text-muted-foreground mt-1">
                  Estado: {currentFoto.tipo === 'inicial' ? 'Inicial' : 'Final'}
                </p>
              )}
              {currentFoto.descripcion && (
                <p className="text-xs text-muted-foreground mt-1">
                  {currentFoto.descripcion}
                </p>
              )}
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Miniaturas (solo si hay más de 1 foto) */}
        {fotos.length > 1 && (
          <div className="px-6 py-4 bg-muted/50 border-t overflow-x-auto">
            <div className="flex gap-2">
              {fotos.map((foto, index) => (
                <button
                  key={foto.id}
                  onClick={() => setCurrentIndex(index)}
                  className={`relative flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                    index === currentIndex
                      ? 'border-primary ring-2 ring-primary'
                      : 'border-transparent opacity-60 hover:opacity-100'
                  }`}
                >
                  <Image
                    src={foto.url || foto.dataUrl || ''}
                    alt={`Miniatura ${index + 1}`}
                    fill
                    className="object-cover"
                    unoptimized={!!foto.url && isR2Url(foto.url)}
                  />
                </button>
              ))}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

