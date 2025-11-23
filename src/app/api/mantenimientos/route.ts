import { NextRequest, NextResponse } from 'next/server'
import { getMantenimientos, createMantenimiento, getMantenimientosPendientes } from '@/services/firebase/mantenimientos'
import { Mantenimiento } from '@/types'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const pendientes = searchParams.get('pendientes')
    
    if (pendientes === 'true') {
      const mantenimientos = await getMantenimientosPendientes()
      return NextResponse.json(mantenimientos)
    }
    
    const mantenimientos = await getMantenimientos()
    return NextResponse.json(mantenimientos)
  } catch (error) {
    console.error('Error en GET /api/mantenimientos:', error)
    return NextResponse.json(
      { error: 'Error al obtener mantenimientos' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const mantenimiento: Omit<Mantenimiento, 'id'> = {
      ordenId: body.ordenId,
      clienteId: body.clienteId,
      vehiculoId: body.vehiculoId,
      fechaRecordatorio: new Date(body.fechaRecordatorio),
      completado: false,
      fechaCompletitud: undefined,
      observaciones: body.observaciones || '',
      fechaCreacion: new Date(),
    }
    
    const id = await createMantenimiento(mantenimiento)
    
    if (!id) {
      return NextResponse.json(
        { error: 'Error al crear mantenimiento' },
        { status: 500 }
      )
    }
    
    return NextResponse.json({ id, ...mantenimiento }, { status: 201 })
  } catch (error) {
    console.error('Error en POST /api/mantenimientos:', error)
    return NextResponse.json(
      { error: 'Error al crear mantenimiento' },
      { status: 500 }
    )
  }
}

