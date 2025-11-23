import { NextRequest, NextResponse } from 'next/server'
import { getOrdenes, createOrden, getNextNumeroOrden } from '@/services/firebase/ordenes'
import { checkNumeroOrdenExists } from '@/services/firebase/validations'
import { OrdenTrabajo } from '@/types'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const estado = searchParams.get('estado')
    
    if (estado && estado !== 'Todos') {
      const { getOrdenesByEstado } = await import('@/services/firebase/ordenes')
      const ordenes = await getOrdenesByEstado(estado as any)
      return NextResponse.json(ordenes)
    }
    
    const ordenes = await getOrdenes()
    return NextResponse.json(ordenes)
  } catch (error) {
    console.error('Error en GET /api/ordenes:', error)
    return NextResponse.json(
      { error: 'Error al obtener órdenes' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Siempre generar número de orden automáticamente para nuevas órdenes
    const numeroOrden = await getNextNumeroOrden()

    const orden: Omit<OrdenTrabajo, 'id'> = {
      clienteId: body.clienteId,
      vehiculoId: body.vehiculoId,
      numeroOrden,
      fechaIngreso: new Date(),
      fechaEntrega: body.fechaEntrega ? new Date(body.fechaEntrega) : undefined,
      estado: body.estado,
      descripcion: body.descripcion,
      servicios: body.servicios,
      costoTotal: body.costoTotal,
      observaciones: body.observaciones,
    }
    
    const id = await createOrden(orden)
    
    if (!id) {
      return NextResponse.json(
        { error: 'Error al crear orden' },
        { status: 500 }
      )
    }
    
    return NextResponse.json({ id, ...orden }, { status: 201 })
  } catch (error) {
    console.error('Error en POST /api/ordenes:', error)
    return NextResponse.json(
      { error: 'Error al crear orden' },
      { status: 500 }
    )
  }
}

