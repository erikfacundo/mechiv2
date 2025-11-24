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
    
    // Validar patente única
    const patenteExists = await checkPatenteExists(body.patente)
    if (patenteExists) {
      return NextResponse.json(
        { error: 'La patente ya está registrada' },
        { status: 400 }
      )
    }

    const vehiculo: Omit<Vehiculo, 'id'> = {
      clienteId: body.clienteId,
      marca: body.marca,
      modelo: body.modelo,
      año: body.año,
      patente: body.patente.toUpperCase(),
      kilometraje: body.kilometraje,
      color: body.color,
      tipoCombustible: body.tipoCombustible,
      fotos: body.fotos || undefined, // Fotos opcionales
    }
    
    const id = await createVehiculo(vehiculo)
    
    if (!id) {
      return NextResponse.json(
        { error: 'Error al crear vehículo' },
        { status: 500 }
      )
    }
    
    return NextResponse.json({ id, ...vehiculo }, { status: 201 })
  } catch (error) {
    console.error('Error en POST /api/vehiculos:', error)
    return NextResponse.json(
      { error: 'Error al crear vehículo' },
      { status: 500 }
    )
  }
}

