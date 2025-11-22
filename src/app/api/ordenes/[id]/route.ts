import { NextRequest, NextResponse } from 'next/server'
import { getOrdenById, updateOrden, deleteOrden } from '@/services/firebase/ordenes'
import { checkNumeroOrdenExists } from '@/services/firebase/validations'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const orden = await getOrdenById(params.id)
    
    if (!orden) {
      return NextResponse.json(
        { error: 'Orden no encontrada' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(orden)
  } catch (error) {
    console.error('Error en GET /api/ordenes/[id]:', error)
    return NextResponse.json(
      { error: 'Error al obtener orden' },
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
    
    // Validar número de orden único si se está cambiando
    if (body.numeroOrden) {
      const numeroExists = await checkNumeroOrdenExists(body.numeroOrden, params.id)
      if (numeroExists) {
        return NextResponse.json(
          { error: 'El número de orden ya existe' },
          { status: 400 }
        )
      }
    }

    const success = await updateOrden(params.id, body)
    
    if (!success) {
      return NextResponse.json(
        { error: 'Error al actualizar orden' },
        { status: 500 }
      )
    }
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error en PUT /api/ordenes/[id]:', error)
    return NextResponse.json(
      { error: 'Error al actualizar orden' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const success = await deleteOrden(params.id)
    
    if (!success) {
      return NextResponse.json(
        { error: 'Error al eliminar orden' },
        { status: 500 }
      )
    }
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error en DELETE /api/ordenes/[id]:', error)
    return NextResponse.json(
      { error: 'Error al eliminar orden' },
      { status: 500 }
    )
  }
}

