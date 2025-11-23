import { NextRequest, NextResponse } from 'next/server'
import { getMantenimientoById, updateMantenimiento, deleteMantenimiento } from '@/services/firebase/mantenimientos'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const mantenimiento = await getMantenimientoById(params.id)
    
    if (!mantenimiento) {
      return NextResponse.json(
        { error: 'Mantenimiento no encontrado' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(mantenimiento)
  } catch (error) {
    console.error('Error en GET /api/mantenimientos/[id]:', error)
    return NextResponse.json(
      { error: 'Error al obtener mantenimiento' },
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
    
    const updateData: any = { ...body }
    
    if (body.fechaRecordatorio) {
      updateData.fechaRecordatorio = new Date(body.fechaRecordatorio)
    }
    
    if (body.fechaCompletitud) {
      updateData.fechaCompletitud = new Date(body.fechaCompletitud)
    }
    
    const success = await updateMantenimiento(params.id, updateData)
    
    if (!success) {
      return NextResponse.json(
        { error: 'Error al actualizar mantenimiento' },
        { status: 500 }
      )
    }
    
    const mantenimiento = await getMantenimientoById(params.id)
    return NextResponse.json(mantenimiento)
  } catch (error) {
    console.error('Error en PUT /api/mantenimientos/[id]:', error)
    return NextResponse.json(
      { error: 'Error al actualizar mantenimiento' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const success = await deleteMantenimiento(params.id)
    
    if (!success) {
      return NextResponse.json(
        { error: 'Error al eliminar mantenimiento' },
        { status: 500 }
      )
    }
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error en DELETE /api/mantenimientos/[id]:', error)
    return NextResponse.json(
      { error: 'Error al eliminar mantenimiento' },
      { status: 500 }
    )
  }
}

