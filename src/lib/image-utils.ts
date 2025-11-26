export interface ImageProcessResult {
  dataUrl: string
  size: number
}

export function resizeAndCompressImage(
  file: File,
  maxWidth: number = 800,
  maxHeight: number = 800,
  quality: number = 0.65
): Promise<ImageProcessResult> {
  return new Promise((resolve, reject) => {
    try {
      const reader = new FileReader()
      
      reader.onload = (e) => {
        try {
          const img = new window.Image()
          
          let timeout: NodeJS.Timeout | null = null
          
          img.onload = () => {
            if (timeout) clearTimeout(timeout)
            
            try {
              let width = img.width
              let height = img.height
              
              if (width > 4000 || height > 4000) {
                maxWidth = 800
                maxHeight = 800
                quality = 0.60
              }
              
              if (width > maxWidth || height > maxHeight) {
                const ratio = Math.min(maxWidth / width, maxHeight / height)
                width = Math.round(width * ratio)
                height = Math.round(height * ratio)
              }
              
              const MAX_CANVAS_SIZE = 16384
              if (width > MAX_CANVAS_SIZE || height > MAX_CANVAS_SIZE) {
                reject(new Error(`La imagen es demasiado grande (${img.width}x${img.height}px). Se redimensionaría a ${width}x${height}px, pero el navegador no puede procesarla. Por favor, reduce el tamaño de la imagen antes de subirla.`))
                return
              }
              
              if (width <= 0 || height <= 0) {
                reject(new Error('Las dimensiones calculadas son inválidas'))
                return
              }
              
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
              
              ctx.imageSmoothingEnabled = true
              ctx.imageSmoothingQuality = 'high'
              
              try {
                ctx.drawImage(img, 0, 0, width, height)
              } catch (drawError) {
                reject(new Error(`Error al dibujar la imagen en el canvas: ${drawError instanceof Error ? drawError.message : 'Error desconocido'}`))
                return
              }
              
              const mimeType = file.type || 'image/jpeg'
              const outputFormat = mimeType.includes('png') ? 'image/png' : 'image/jpeg'
              
              canvas.toBlob(
                (blob) => {
                  if (!blob) {
                    reject(new Error('Error al comprimir la imagen'))
                    return
                  }
                  
                  const reader = new FileReader()
                  reader.onload = () => {
                    resolve({ 
                      dataUrl: reader.result as string,
                      size: blob.size
                    })
                  }
                  reader.onerror = () => {
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
          
          img.onerror = () => {
            if (timeout) clearTimeout(timeout)
            reject(new Error('Error al cargar la imagen en el navegador. La imagen puede estar corrupta o ser demasiado grande para procesar.'))
          }
          
          timeout = setTimeout(() => {
            reject(new Error('La imagen tardó demasiado en cargar (más de 30 segundos). Puede ser demasiado grande. Intenta con una imagen más pequeña o cierra otras pestañas del navegador.'))
          }, 30000)
          
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

