"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Camera, Image as ImageIcon, X, Upload } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { FotoVehiculo, FotoOrden } from "@/types"
import Image from "next/image"

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

        // Validar tamaño (máximo 5MB por foto)
        if (file.size > 5 * 1024 * 1024) {
          toast({
            title: "Imagen muy grande",
            description: `${file.name} es muy grande. Máximo 5MB por foto.`,
            variant: "destructive",
          })
          continue
        }

        // Convertir a base64
        const dataUrl = await fileToBase64(file)
        
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
      toast({
        title: "Error",
        description: "Error al procesar las fotos. Intenta nuevamente.",
        variant: "destructive",
      })
    } finally {
      setUploading(false)
      // Limpiar inputs
      if (fileInputRef.current) fileInputRef.current.value = ''
      if (cameraInputRef.current) cameraInputRef.current.value = ''
    }
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
              <Image
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

