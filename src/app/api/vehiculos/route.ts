import { NextRequest, NextResponse } from 'next/server'
import { getVehiculos, createVehiculo } from '@/services/firebase/vehiculos'
import { checkPatenteExists } from '@/services/firebase/validations'
import { Vehiculo, FotoVehiculo } from '@/types'
import { uploadImageToR2, base64ToBuffer } from '@/lib/r2-storage'

export async function GET() {
  try {
    console.log('GET /api/vehiculos - Iniciando obtención de vehículos...')
    const vehiculos = await getVehiculos()
    console.log(`GET /api/vehiculos - Se obtuvieron ${vehiculos.length} vehículos`)
    
    if (vehiculos.length > 0) {
      console.log('GET /api/vehiculos - Primer vehículo:', {
        id: vehiculos[0].id,
        patente: vehiculos[0].patente,
        marca: vehiculos[0].marca,
        modelo: vehiculos[0].modelo
      })
    }
    
    return NextResponse.json(vehiculos)
  } catch (error) {
    console.error('Error en GET /api/vehiculos:', error)
    return NextResponse.json(
      { error: 'Error al obtener vehículos' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Calcular tamaño aproximado del payload
    const payloadSize = JSON.stringify(body).length
    const payloadSizeKB = (payloadSize / 1024).toFixed(2)
    
    console.log('POST /api/vehiculos - Body recibido:', {
      patente: body.patente,
      clienteId: body.clienteId,
      marca: body.marca,
      modelo: body.modelo,
      año: body.año,
      fotosCount: body.fotos?.length || 0,
      payloadSizeKB: `${payloadSizeKB} KB`,
      fotosConUrl: body.fotos?.filter((f: any) => f.url).length || 0,
      fotosConDataUrl: body.fotos?.filter((f: any) => f.dataUrl).length || 0,
    })
    
    // Validar campos requeridos
    if (!body.patente) {
      console.error('POST /api/vehiculos - Error: patente faltante')
      return NextResponse.json(
        { error: 'La patente es requerida', message: 'La patente es requerida' },
        { status: 400 }
      )
    }
    
    if (!body.clienteId) {
      console.error('POST /api/vehiculos - Error: clienteId faltante')
      return NextResponse.json(
        { error: 'El cliente es requerido', message: 'El cliente es requerido' },
        { status: 400 }
      )
    }
    
    // Validar patente única
    try {
      const patenteExists = await checkPatenteExists(body.patente)
      if (patenteExists) {
        console.error('POST /api/vehiculos - Error: patente duplicada:', body.patente)
        return NextResponse.json(
          { error: 'La patente ya está registrada', message: 'La patente ya está registrada' },
          { status: 400 }
        )
      }
    } catch (validationError) {
      console.error('Error validando patente:', validationError)
      // Continuar si hay error en la validación (puede ser que Firebase no esté disponible)
    }

    // Procesar fotos: subir base64 a R2 y limpiar dataUrl
    let fotosProcesadas: FotoVehiculo[] | undefined = undefined
    
    if (body.fotos && body.fotos.length > 0) {
      const patenteNormalizada = body.patente.toUpperCase()
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
    }

    const vehiculo: Omit<Vehiculo, 'id'> = {
      clienteId: body.clienteId,
      marca: body.marca || '',
      modelo: body.modelo || '',
      año: body.año || new Date().getFullYear(),
      patente: body.patente.toUpperCase(),
      kilometraje: body.kilometraje || 0,
      color: body.color || '',
      tipoCombustible: body.tipoCombustible || 'nafta',
      fotos: fotosProcesadas && fotosProcesadas.length > 0 ? fotosProcesadas : undefined,
    }
    
    const id = await createVehiculo(vehiculo)
    
    if (!id) {
      return NextResponse.json(
        { error: 'Error al crear vehículo en Firestore' },
        { status: 500 }
      )
    }
    
    return NextResponse.json({ id, ...vehiculo }, { status: 201 })
  } catch (error) {
    console.error('Error en POST /api/vehiculos:', error)
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
    return NextResponse.json(
      { 
        error: 'Error al crear vehículo',
        details: process.env.NODE_ENV === 'development' ? errorMessage : undefined,
        message: errorMessage
      },
      { status: 500 }
    )
  }
}

