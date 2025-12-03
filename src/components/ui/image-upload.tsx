"use client"

import { useState, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Camera, Image as ImageIcon, X } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { FotoVehiculo, FotoOrden } from "@/types"
import NextImage from "next/image"
import { resizeAndCompressImage } from "@/lib/image-utils"
import { isR2Url } from "@/lib/r2-storage"

interface ImageUploadProps {
  fotos: (FotoVehiculo | FotoOrden)[]
  onFotosChange: (fotos: (FotoVehiculo | FotoOrden)[]) => void
  maxFotos?: number
  label?: string
}

export function ImageUpload({ 
  fotos, 
  onFotosChange, 
  maxFotos = 20,
  label = "Fotos del vehículo"
}: ImageUploadProps) {
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)

  const handleFileSelect = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return

    const filesArray = Array.from(files)
    
    // Validar límite de fotos
    if (fotos.length + filesArray.length > maxFotos) {
      toast({
        title: "Límite de fotos alcanzado",
        description: `Puedes subir máximo ${maxFotos} fotos. Ya tienes ${fotos.length}.`,
        variant: "destructive",
      })
      return
    }

    setUploading(true)

    try {
      const nuevasFotos: FotoVehiculo[] = []

      for (const file of filesArray) {
        if (!file.type.startsWith('image/')) {
          toast({
            title: "Archivo inválido",
            description: `${file.name} no es una imagen válida.`,
            variant: "destructive",
          })
          continue
        }

        if (file.size > 50 * 1024 * 1024) {
          toast({
            title: "Imagen muy grande",
            description: `${file.name} es muy grande (${(file.size / 1024 / 1024).toFixed(2)}MB). Máximo 50MB antes de procesar.`,
            variant: "destructive",
          })
          continue
        }

        let r2Url: string | undefined
        let dataUrl: string | undefined
        try {
          // Procesar imagen (redimensionar y comprimir)
          const result = await resizeAndCompressImage(file)
          const processedSize = result.size
          
          // Intentar subir a R2 primero
          // Nota: La patente se pasará cuando esté disponible en el formulario
          try {
            const uploadResponse = await fetch('/api/upload', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                image: result.dataUrl,
                fileName: file.name,
                // patente se agregará cuando el vehículo se guarde (en el endpoint)
              }),
            })

            if (uploadResponse.ok) {
              const uploadData = await uploadResponse.json()
              // Usar URL de R2
              r2Url = uploadData.url
              console.log('Imagen subida exitosamente a R2:', r2Url)
            } else {
              // Si falla R2, usar base64 como fallback
              const errorData = await uploadResponse.json().catch(() => ({}))
              console.warn('R2 upload failed, using base64 fallback:', {
                status: uploadResponse.status,
                error: errorData.error || errorData.message || 'Unknown error'
              })
              
              // Mostrar advertencia al usuario
              toast({
                title: "Advertencia",
                description: "No se pudo subir la imagen a R2. Se guardará localmente (puede ser lento).",
                variant: "default",
              })
              
              dataUrl = result.dataUrl
              
              // Validar tamaño solo si usamos base64
              if (processedSize > 200 * 1024) {
                toast({
                  title: "Imagen aún muy grande",
                  description: `${file.name} sigue siendo muy grande después de procesar (${(processedSize / 1024).toFixed(0)}KB). Máximo 200KB por foto. Intenta con una imagen de menor resolución.`,
                  variant: "destructive",
                })
                continue
              }
              
              // Validar tamaño total solo para base64
              const currentTotalSize = fotos.reduce((sum, foto) => {
                // Solo contar fotos base64 (las URLs no cuentan)
                if (foto.dataUrl && foto.dataUrl.startsWith('data:')) {
                  return sum + (foto.dataUrl.length * 0.75)
                }
                return sum
              }, 0)
              const newTotalSize = currentTotalSize + processedSize
              
              if (newTotalSize > 600 * 1024) {
                toast({
                  title: "Demasiadas fotos",
                  description: `El tamaño total de las fotos (${(newTotalSize / 1024).toFixed(0)}KB) excede el límite de 600KB. Firestore tiene un límite de 1MB por documento. Elimina algunas fotos o reduce su tamaño.`,
                  variant: "destructive",
                })
                continue
              }
            }
          } catch (uploadError) {
            // Error al subir a R2, usar base64 como fallback
            console.error('R2 upload error, using base64 fallback:', uploadError)
            
            // Mostrar advertencia al usuario
            toast({
              title: "Advertencia",
              description: "No se pudo subir la imagen a R2. Se guardará localmente (puede ser lento).",
              variant: "default",
            })
            
            dataUrl = result.dataUrl
            
            // Validar tamaño solo si usamos base64
            if (processedSize > 200 * 1024) {
              toast({
                title: "Imagen aún muy grande",
                description: `${file.name} sigue siendo muy grande después de procesar (${(processedSize / 1024).toFixed(0)}KB). Máximo 200KB por foto. Intenta con una imagen de menor resolución.`,
                variant: "destructive",
              })
              continue
            }
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
          toast({
            title: "Error al procesar imagen",
            description: `No se pudo procesar ${file.name}. ${errorMessage}`,
            variant: "destructive",
          })
          continue
        }
        
        const nuevaFoto: FotoVehiculo = {
          id: `foto-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          ...(r2Url ? { url: r2Url } : { dataUrl }),
          fechaHora: new Date(), // Fecha y hora exacta de cuando se subió
        }

        nuevasFotos.push(nuevaFoto)
      }

      if (nuevasFotos.length > 0) {
        onFotosChange([...fotos, ...nuevasFotos])
        toast({
          title: "Fotos agregadas",
          description: `Se agregaron ${nuevasFotos.length} foto${nuevasFotos.length > 1 ? 's' : ''} correctamente.`,
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error al procesar las fotos. Intenta nuevamente.",
        variant: "destructive",
      })
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
      if (cameraInputRef.current) cameraInputRef.current.value = ''
    }
  }, [fotos, maxFotos, toast, onFotosChange])


  const handleRemoveFoto = useCallback(async (fotoId: string) => {
    const foto = fotos.find(f => f.id === fotoId)
    
    // Si la foto está en R2 (tiene url), eliminarla también
    if (foto && foto.url) {
      try {
        await fetch(`/api/upload?url=${encodeURIComponent(foto.url)}`, {
          method: 'DELETE',
        })
      } catch (error) {
        console.error('Error deleting image from R2:', error)
        // Continuar aunque falle la eliminación en R2
      }
    }
    
    onFotosChange(fotos.filter(f => f.id !== fotoId))
    toast({
      title: "Foto eliminada",
      description: "La foto se eliminó correctamente.",
    })
  }, [fotos, onFotosChange, toast])

  const handleGalleryClick = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  const handleCameraClick = useCallback(() => {
    cameraInputRef.current?.click()
  }, [])

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">{label}</label>
        <span className="text-xs text-muted-foreground">
          {fotos.length} / {maxFotos} fotos
        </span>
      </div>

      {/* Botones de acción */}
      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={handleGalleryClick}
          disabled={uploading || fotos.length >= maxFotos}
          className="flex-1"
        >
          <ImageIcon className="h-4 w-4 mr-2" />
          Galería
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={handleCameraClick}
          disabled={uploading || fotos.length >= maxFotos}
          className="flex-1"
        >
          <Camera className="h-4 w-4 mr-2" />
          Cámara
        </Button>
      </div>

      {/* Inputs ocultos */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={(e) => handleFileSelect(e.target.files)}
        className="hidden"
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        multiple
        onChange={(e) => handleFileSelect(e.target.files)}
        className="hidden"
      />

      {/* Vista previa de fotos */}
      {fotos.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {fotos.map((foto) => (
            <div
              key={foto.id}
              className="relative group aspect-square rounded-lg overflow-hidden border border-border bg-muted"
            >
              <NextImage
                src={foto.url || foto.dataUrl || ''}
                alt="Foto del vehículo"
                fill
                className="object-cover"
                sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
                unoptimized={!!foto.url && isR2Url(foto.url)}
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors flex items-center justify-center">
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8"
                  onClick={() => handleRemoveFoto(foto.id)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-xs p-1 px-2">
                {new Date(foto.fechaHora).toLocaleString('es-AR', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit'
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {uploading && (
        <div className="text-center py-4">
          <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
            Procesando fotos...
          </div>
        </div>
      )}

      {fotos.length === 0 && !uploading && (
        <div className="border-2 border-dashed rounded-lg p-8 text-center text-muted-foreground">
          <ImageIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No hay fotos agregadas</p>
          <p className="text-xs mt-1">Usa los botones de arriba para agregar fotos</p>
        </div>
      )}
    </div>
  )
}

