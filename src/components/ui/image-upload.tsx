"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Camera, Image as ImageIcon, X, Upload } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { FotoVehiculo, FotoOrden } from "@/types"
import NextImage from "next/image"

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

  const handleFileSelect = async (files: FileList | null, source: 'gallery' | 'camera') => {
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
        // Validar que sea una imagen
        if (!file.type.startsWith('image/')) {
          toast({
            title: "Archivo inválido",
            description: `${file.name} no es una imagen válida.`,
            variant: "destructive",
          })
          continue
        }

        // Validar tamaño inicial (máximo 50MB - se redimensionará y comprimirá después)
        // Este límite es solo para evitar archivos extremadamente grandes que puedan causar problemas de memoria
        if (file.size > 50 * 1024 * 1024) {
          toast({
            title: "Imagen muy grande",
            description: `${file.name} es muy grande (${(file.size / 1024 / 1024).toFixed(2)}MB). Máximo 50MB antes de procesar.`,
            variant: "destructive",
          })
          continue
        }

        // Redimensionar y comprimir imagen antes de convertir a base64
        // No validamos el tamaño antes porque después del procesamiento será mucho más pequeño
        let dataUrl: string
        try {
          console.log(`Procesando imagen: ${file.name}, tamaño original: ${(file.size / 1024 / 1024).toFixed(2)}MB`)
          const result = await resizeAndCompressImage(file)
          dataUrl = result.dataUrl
          const processedSize = result.size
          console.log(`Imagen procesada exitosamente: ${file.name}, tamaño final: ${(processedSize / 1024 / 1024).toFixed(2)}MB`)
          
          // Validar tamaño después del procesamiento (máximo 200KB por foto)
          // Firestore tiene un límite de 1MB por documento, así que limitamos cada foto a 200KB
          // para permitir múltiples fotos sin exceder el límite
          if (processedSize > 200 * 1024) {
            toast({
              title: "Imagen aún muy grande",
              description: `${file.name} sigue siendo muy grande después de procesar (${(processedSize / 1024).toFixed(0)}KB). Máximo 200KB por foto. Intenta con una imagen de menor resolución.`,
              variant: "destructive",
            })
            continue
          }
          
          // Validar tamaño total de todas las fotos (máximo 600KB total para dejar espacio para otros datos)
          const currentTotalSize = fotos.reduce((sum, foto) => {
            // Estimar tamaño de cada foto existente (base64 es ~33% más grande que el binario)
            return sum + (foto.dataUrl.length * 0.75)
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
        } catch (error) {
          console.error('Error procesando imagen:', error)
          const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
          toast({
            title: "Error al procesar imagen",
            description: `No se pudo procesar ${file.name}. ${errorMessage}`,
            variant: "destructive",
          })
          continue
        }
        
        // Crear objeto FotoVehiculo con fecha/hora exacta
        const nuevaFoto: FotoVehiculo = {
          id: `foto-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          dataUrl,
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
      console.error('Error procesando fotos:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error al procesar las fotos. Intenta nuevamente.",
        variant: "destructive",
      })
    } finally {
      setUploading(false)
      // Limpiar inputs
      if (fileInputRef.current) fileInputRef.current.value = ''
      if (cameraInputRef.current) cameraInputRef.current.value = ''
    }
  }

  /**
   * Redimensiona y comprime una imagen manteniendo la calidad
   * @param file - Archivo de imagen original
   * @param maxWidth - Ancho máximo en píxeles (default: 1920)
   * @param maxHeight - Alto máximo en píxeles (default: 1920)
   * @param quality - Calidad de compresión 0-1 (default: 0.85)
   * @returns Promise con el dataUrl y tamaño de la imagen procesada
   */
  const resizeAndCompressImage = (
    file: File,
    maxWidth: number = 800, // Reducido a 800px para archivos más pequeños
    maxHeight: number = 800, // Reducido a 800px para archivos más pequeños
    quality: number = 0.65 // Reducido a 65% para archivos más pequeños
  ): Promise<{ dataUrl: string; size: number }> => {
    return new Promise((resolve, reject) => {
      try {
        const reader = new FileReader()
        
        reader.onload = (e) => {
          try {
            // Usar la API nativa del navegador, no el componente de Next.js
            const img = new window.Image()
            
            // Timeout para imágenes que tardan mucho en cargar
            let timeout: NodeJS.Timeout | null = null
            
            img.onload = () => {
              if (timeout) clearTimeout(timeout)
              
              try {
                console.log(`Imagen cargada: ${img.width}x${img.height}px`)
                
                // Calcular nuevas dimensiones manteniendo aspect ratio
                let width = img.width
                let height = img.height
                
                // Para imágenes muy grandes (como 12240x16320), reducir más agresivamente
                if (width > 4000 || height > 4000) {
                  console.log(`Imagen muy grande detectada, reduciendo a 800px`)
                  maxWidth = 800
                  maxHeight = 800
                  quality = 0.60 // Reducir calidad más para imágenes muy grandes
                }
                
                // Siempre redimensionar si es más grande que el máximo
                if (width > maxWidth || height > maxHeight) {
                  const ratio = Math.min(maxWidth / width, maxHeight / height)
                  width = Math.round(width * ratio)
                  height = Math.round(height * ratio)
                  console.log(`Redimensionando a: ${width}x${height}px`)
                }
                
                // Validar que las dimensiones no sean demasiado grandes para el canvas
                const MAX_CANVAS_SIZE = 16384 // Límite típico del navegador
                if (width > MAX_CANVAS_SIZE || height > MAX_CANVAS_SIZE) {
                  reject(new Error(`La imagen es demasiado grande (${img.width}x${img.height}px). Se redimensionaría a ${width}x${height}px, pero el navegador no puede procesarla. Por favor, reduce el tamaño de la imagen antes de subirla.`))
                  return
                }
                
                // Validar dimensiones mínimas del canvas
                if (width <= 0 || height <= 0) {
                  reject(new Error('Las dimensiones calculadas son inválidas'))
                  return
                }
                
                console.log(`Creando canvas: ${width}x${height}px`)
                
                // Crear canvas para redimensionar
                const canvas = document.createElement('canvas')
                canvas.width = width
                canvas.height = height
                
                const ctx = canvas.getContext('2d', { 
                  willReadFrequently: false,
                  alpha: true 
                })
                if (!ctx) {
                  reject(new Error('No se pudo obtener el contexto del canvas. El navegador puede no soportar esta operación.'))
                  return
                }
                
                // Configurar calidad de renderizado
                ctx.imageSmoothingEnabled = true
                ctx.imageSmoothingQuality = 'high'
                
                // Dibujar imagen redimensionada
                try {
                  ctx.drawImage(img, 0, 0, width, height)
                  console.log('Imagen dibujada en canvas exitosamente')
                } catch (drawError) {
                  reject(new Error(`Error al dibujar la imagen en el canvas: ${drawError instanceof Error ? drawError.message : 'Error desconocido'}`))
                  return
                }
                
                // Convertir a base64 con compresión
                const mimeType = file.type || 'image/jpeg'
                const outputFormat = mimeType.includes('png') ? 'image/png' : 'image/jpeg'
                
                console.log(`Comprimiendo imagen a ${outputFormat} con calidad ${quality}`)
                
                canvas.toBlob(
                  (blob) => {
                    if (!blob) {
                      reject(new Error('Error al comprimir la imagen'))
                      return
                    }
                    
                    console.log(`Imagen comprimida: ${(blob.size / 1024 / 1024).toFixed(2)}MB`)
                    
                    // Convertir blob a base64
                    const reader = new FileReader()
                    reader.onload = () => {
                      console.log('Imagen convertida a base64 exitosamente')
                      resolve({ 
                        dataUrl: reader.result as string,
                        size: blob.size
                      })
                    }
                    reader.onerror = (err) => {
                      console.error('Error al convertir a base64:', err)
                      reject(new Error('Error al convertir imagen a base64'))
                    }
                    reader.readAsDataURL(blob)
                  },
                  outputFormat,
                  quality
                )
              } catch (error) {
                reject(new Error(`Error al procesar la imagen: ${error instanceof Error ? error.message : 'Error desconocido'}`))
              }
            }
            
            img.onerror = (err) => {
              if (timeout) clearTimeout(timeout)
              console.error('Error al cargar imagen:', err)
              reject(new Error('Error al cargar la imagen en el navegador. La imagen puede estar corrupta o ser demasiado grande para procesar.'))
            }
            
            // Configurar timeout antes de asignar src
            timeout = setTimeout(() => {
              reject(new Error('La imagen tardó demasiado en cargar (más de 30 segundos). Puede ser demasiado grande. Intenta con una imagen más pequeña o cierra otras pestañas del navegador.'))
            }, 30000) // 30 segundos
            
            img.src = e.target?.result as string
          } catch (error) {
            reject(new Error(`Error al procesar el archivo: ${error instanceof Error ? error.message : 'Error desconocido'}`))
          }
        }
        
        reader.onerror = () => reject(new Error('Error al leer el archivo'))
        reader.readAsDataURL(file)
      } catch (error) {
        reject(new Error(`Error al iniciar el procesamiento: ${error instanceof Error ? error.message : 'Error desconocido'}`))
      }
    })
  }

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

  const handleRemoveFoto = (fotoId: string) => {
    onFotosChange(fotos.filter(f => f.id !== fotoId))
    toast({
      title: "Foto eliminada",
      description: "La foto se eliminó correctamente.",
    })
  }

  const handleGalleryClick = () => {
    fileInputRef.current?.click()
  }

  const handleCameraClick = () => {
    cameraInputRef.current?.click()
  }

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
        onChange={(e) => handleFileSelect(e.target.files, 'gallery')}
        className="hidden"
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        multiple
        onChange={(e) => handleFileSelect(e.target.files, 'camera')}
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
                src={foto.dataUrl}
                alt="Foto del vehículo"
                fill
                className="object-cover"
                sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
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

