import { NextRequest, NextResponse } from 'next/server'
import { getVehiculos, createVehiculo } from '@/services/firebase/vehiculos'
import { checkPatenteExists } from '@/services/firebase/validations'
import { Vehiculo } from '@/types'

export async function GET() {
  try {
    const vehiculos = await getVehiculos()
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
    
    console.log('POST /api/vehiculos - Body recibido:', {
      patente: body.patente,
      clienteId: body.clienteId,
      marca: body.marca,
      modelo: body.modelo,
      fotosCount: body.fotos?.length || 0
    })
    
    // Validar campos requeridos
    if (!body.patente) {
      return NextResponse.json(
        { error: 'La patente es requerida' },
        { status: 400 }
      )
    }
    
    if (!body.clienteId) {
      return NextResponse.json(
        { error: 'El cliente es requerido' },
        { status: 400 }
      )
    }
    
    // Validar patente única
    try {
      const patenteExists = await checkPatenteExists(body.patente)
      if (patenteExists) {
        return NextResponse.json(
          { error: 'La patente ya está registrada' },
          { status: 400 }
        )
      }
    } catch (validationError) {
      console.error('Error validando patente:', validationError)
      // Continuar si hay error en la validación (puede ser que Firebase no esté disponible)
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
      fotos: body.fotos || undefined, // Fotos opcionales
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

