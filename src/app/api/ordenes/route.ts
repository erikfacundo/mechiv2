import { NextRequest, NextResponse } from 'next/server'
import { getOrdenes, createOrden, getNextNumeroOrden, getOrdenById } from '@/services/firebase/ordenes'
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
      estado: body.estado || 'Pendiente',
      descripcion: body.descripcion,
      servicios: body.servicios || [],
      costoTotal: body.costoTotal || 0,
      observaciones: body.observaciones,
      checklist: body.checklist || [],
      gastos: body.gastos || [],
      porcentajeCompletitud: body.porcentajeCompletitud || 0,
      esMantenimiento: body.esMantenimiento || false,
      fechaRecordatorioMantenimiento: body.fechaRecordatorioMantenimiento 
        ? new Date(body.fechaRecordatorioMantenimiento) 
        : undefined,
    }
    
    // Si es mantenimiento y tiene fecha de recordatorio, crear el mantenimiento
    if (orden.esMantenimiento && orden.fechaRecordatorioMantenimiento) {
      const { createMantenimiento } = await import('@/services/firebase/mantenimientos')
      await createMantenimiento({
        ordenId: '', // Se actualizará después de crear la orden
        clienteId: orden.clienteId,
        vehiculoId: orden.vehiculoId,
        fechaRecordatorio: orden.fechaRecordatorioMantenimiento,
        completado: false,
        observaciones: `Recordatorio de mantenimiento para orden ${numeroOrden}`,
        fechaCreacion: new Date(),
      })
    }
    
    const id = await createOrden(orden)
    
    if (!id) {
      return NextResponse.json(
        { error: 'Error al crear orden' },
        { status: 500 }
      )
    }
    
    // Si es mantenimiento, actualizar el mantenimiento con el ID de la orden
    if (orden.esMantenimiento && orden.fechaRecordatorioMantenimiento) {
      const { getMantenimientos } = await import('@/services/firebase/mantenimientos')
      const mantenimientos = await getMantenimientos()
      const mantenimientoPendiente = mantenimientos
        .filter(m => !m.completado && m.clienteId === orden.clienteId && m.vehiculoId === orden.vehiculoId)
        .sort((a, b) => b.fechaCreacion.getTime() - a.fechaCreacion.getTime())[0]
      
      if (mantenimientoPendiente) {
        const { updateMantenimiento } = await import('@/services/firebase/mantenimientos')
        await updateMantenimiento(mantenimientoPendiente.id, { ordenId: id })
      }
    }
    
    const ordenCreada = await getOrdenById(id)
    return NextResponse.json(ordenCreada || { id, ...orden }, { status: 201 })
  } catch (error) {
    console.error('Error en POST /api/ordenes:', error)
    return NextResponse.json(
      { error: 'Error al crear orden' },
      { status: 500 }
    )
  }
}

