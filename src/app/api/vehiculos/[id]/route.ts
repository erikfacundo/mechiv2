import { NextRequest, NextResponse } from 'next/server'
import { getVehiculoById, updateVehiculo, deleteVehiculo } from '@/services/firebase/vehiculos'
import { checkPatenteExists } from '@/services/firebase/validations'

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

