import { NextRequest, NextResponse } from 'next/server'
import { getVehiculoById, updateVehiculo, deleteVehiculo } from '@/services/firebase/vehiculos'
import { checkPatenteExists } from '@/services/firebase/validations'
import { FotoVehiculo } from '@/types'
import { uploadImageToR2, base64ToBuffer } from '@/lib/r2-storage'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const vehiculo = await getVehiculoById(params.id)
    
    if (!vehiculo) {
      return NextResponse.json(
        { error: 'Vehículo no encontrado' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(vehiculo)
  } catch (error) {
    console.error('Error en GET /api/vehiculos/[id]:', error)
    return NextResponse.json(
      { error: 'Error al obtener vehículo' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    
    // Obtener vehículo actual para obtener la patente si no se está cambiando
    const vehiculoActual = await getVehiculoById(params.id)
    const patenteActual = vehiculoActual?.patente || ''
    
    // Validar patente única si se está cambiando
    if (body.patente) {
      const patenteExists = await checkPatenteExists(body.patente, params.id)
      if (patenteExists) {
        return NextResponse.json(
          { error: 'La patente ya está registrada' },
          { status: 400 }
        )
      }
      body.patente = body.patente.toUpperCase()
    }
    
    // Procesar fotos: subir base64 a R2 y limpiar dataUrl
    let fotosProcesadas: FotoVehiculo[] | undefined = undefined
    
    if (body.fotos && body.fotos.length > 0) {
      const patenteNormalizada = body.patente?.toUpperCase() || patenteActual
      fotosProcesadas = []
      
      for (const foto of body.fotos) {
        // Si ya tiene URL de R2, solo guardar metadata (sin dataUrl)
        if (foto.url) {
          const { dataUrl, ...fotoLimpia } = foto
          fotosProcesadas.push({
            ...fotoLimpia,
            fechaHora: foto.fechaHora ? new Date(foto.fechaHora) : new Date(),
          })
        } 
        // Si tiene dataUrl (base64), subirlo a R2 primero
        else if (foto.dataUrl) {
          try {
            // Convertir base64 a buffer
            let imageBuffer: Buffer
            let contentType = 'image/jpeg'
            
            if (foto.dataUrl.startsWith('data:')) {
              const matches = foto.dataUrl.match(/^data:([^;]+);base64,(.+)$/)
              if (matches) {
                contentType = matches[1] || 'image/jpeg'
                imageBuffer = Buffer.from(matches[2], 'base64')
              } else {
                imageBuffer = base64ToBuffer(foto.dataUrl)
              }
            } else {
              imageBuffer = base64ToBuffer(foto.dataUrl)
            }
            
            // Generar nombre de archivo
            const timestamp = Date.now()
            const randomStr = Math.random().toString(36).substring(2, 9)
            const extension = contentType.includes('png') ? 'png' : 'jpg'
            const fileName = `foto-${timestamp}-${randomStr}.${extension}`
            
            // Subir a R2 con la patente
            const r2Url = await uploadImageToR2(imageBuffer, fileName, contentType, patenteNormalizada)
            
            // Guardar solo la URL, sin dataUrl
            fotosProcesadas.push({
              id: foto.id,
              url: r2Url,
              fechaHora: foto.fechaHora ? new Date(foto.fechaHora) : new Date(),
              descripcion: foto.descripcion,
            })
            
            console.log(`Foto ${foto.id} subida a R2: ${r2Url}`)
          } catch (uploadError) {
            console.error(`Error subiendo foto ${foto.id} a R2:`, uploadError)
            // Si falla la subida a R2, omitir la foto (no guardar base64)
            console.warn(`Omitiendo foto ${foto.id} debido a error en R2`)
          }
        }
      }
      
      // Actualizar body con fotos procesadas
      if (fotosProcesadas && fotosProcesadas.length > 0) {
        body.fotos = fotosProcesadas
      } else {
        body.fotos = undefined
      }
    }

    const success = await updateVehiculo(params.id, body)
    
    if (!success) {
      return NextResponse.json(
        { error: 'Error al actualizar vehículo' },
        { status: 500 }
      )
    }
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error en PUT /api/vehiculos/[id]:', error)
    return NextResponse.json(
      { error: 'Error al actualizar vehículo' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const success = await deleteVehiculo(params.id)
    
    if (!success) {
      return NextResponse.json(
        { error: 'Error al eliminar vehículo' },
        { status: 500 }
      )
    }
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error en DELETE /api/vehiculos/[id]:', error)
    return NextResponse.json(
      { error: 'Error al eliminar vehículo' },
      { status: 500 }
    )
  }
}

