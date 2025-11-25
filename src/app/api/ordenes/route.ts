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
      // Serializar fechas a ISO strings para JSON
      const ordenesSerializadas = ordenes.map(orden => ({
        ...orden,
        fechaIngreso: orden.fechaIngreso.toISOString(),
        fechaEntrega: orden.fechaEntrega?.toISOString(),
        fechaRecordatorioMantenimiento: orden.fechaRecordatorioMantenimiento?.toISOString(),
        checklist: orden.checklist?.map(item => ({
          ...item,
          fechaCompletitud: item.fechaCompletitud?.toISOString(),
        })),
        gastos: orden.gastos?.map(gasto => ({
          ...gasto,
          fecha: gasto.fecha.toISOString(),
        })),
        fotos: orden.fotos?.map(foto => ({
          ...foto,
          fechaHora: foto.fechaHora.toISOString(),
        })),
      }))
      return NextResponse.json(ordenesSerializadas)
    }
    
    const ordenes = await getOrdenes()
    // Serializar fechas a ISO strings para JSON
    const ordenesSerializadas = ordenes.map(orden => ({
      ...orden,
      fechaIngreso: orden.fechaIngreso.toISOString(),
      fechaEntrega: orden.fechaEntrega?.toISOString(),
      fechaRecordatorioMantenimiento: orden.fechaRecordatorioMantenimiento?.toISOString(),
      checklist: orden.checklist?.map(item => ({
        ...item,
        fechaCompletitud: item.fechaCompletitud?.toISOString(),
      })),
      gastos: orden.gastos?.map(gasto => ({
        ...gasto,
        fecha: gasto.fecha.toISOString(),
      })),
      fotos: orden.fotos?.map(foto => ({
        ...foto,
        fechaHora: foto.fechaHora.toISOString(),
      })),
    }))
    return NextResponse.json(ordenesSerializadas)
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
    
    // Validar campos requeridos
    if (!body.clienteId || !body.vehiculoId) {
      return NextResponse.json(
        { error: 'Cliente y vehículo son requeridos' },
        { status: 400 }
      )
    }
    
    // Siempre generar número de orden automáticamente para nuevas órdenes
    const numeroOrden = await getNextNumeroOrden()

    // Procesar fotos: convertir fechaHora de string a Date si es necesario
    let fotosProcesadas = undefined
    if (body.fotos && Array.isArray(body.fotos) && body.fotos.length > 0) {
      fotosProcesadas = body.fotos.map((foto: any) => ({
        ...foto,
        fechaHora: foto.fechaHora instanceof Date 
          ? foto.fechaHora 
          : foto.fechaHora 
            ? new Date(foto.fechaHora) 
            : new Date(),
      }))
    }

    const orden: Omit<OrdenTrabajo, 'id'> = {
      clienteId: body.clienteId,
      vehiculoId: body.vehiculoId,
      numeroOrden,
      fechaIngreso: body.fechaIngreso ? new Date(body.fechaIngreso) : new Date(),
      fechaEntrega: body.fechaEntrega ? new Date(body.fechaEntrega) : undefined,
      estado: body.estado || 'Pendiente',
      descripcion: body.descripcion || '',
      servicios: body.servicios || [],
      manoObra: body.manoObra || body.costoTotal || 0, // Mano de obra cobrada
      costoTotal: body.manoObra || body.costoTotal || 0, // Total = mano de obra (gastos se agregan después)
      observaciones: body.observaciones || '',
      checklist: body.checklist || [],
      gastos: body.gastos || [],
      porcentajeCompletitud: body.porcentajeCompletitud || 0,
      esMantenimiento: body.esMantenimiento || false,
      fechaRecordatorioMantenimiento: body.fechaRecordatorioMantenimiento 
        ? new Date(body.fechaRecordatorioMantenimiento) 
        : undefined,
      fotos: fotosProcesadas,
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
    
    // Serializar fechas a ISO strings para JSON
    if (ordenCreada) {
      const ordenSerializada = {
        ...ordenCreada,
        fechaIngreso: ordenCreada.fechaIngreso.toISOString(),
        fechaEntrega: ordenCreada.fechaEntrega?.toISOString(),
        fechaRecordatorioMantenimiento: ordenCreada.fechaRecordatorioMantenimiento?.toISOString(),
        checklist: ordenCreada.checklist?.map(item => ({
          ...item,
          fechaCompletitud: item.fechaCompletitud?.toISOString(),
        })),
        gastos: ordenCreada.gastos?.map(gasto => ({
          ...gasto,
          fecha: gasto.fecha.toISOString(),
        })),
        fotos: ordenCreada.fotos?.map(foto => ({
          ...foto,
          fechaHora: foto.fechaHora.toISOString(),
        })),
      }
      return NextResponse.json(ordenSerializada, { status: 201 })
    }
    
    // Fallback si no se puede obtener la orden creada
    const ordenFallback = {
      id,
      ...orden,
      fechaIngreso: orden.fechaIngreso.toISOString(),
      fechaEntrega: orden.fechaEntrega?.toISOString(),
      fechaRecordatorioMantenimiento: orden.fechaRecordatorioMantenimiento?.toISOString(),
      checklist: orden.checklist?.map(item => ({
        ...item,
        fechaCompletitud: item.fechaCompletitud?.toISOString(),
      })),
      gastos: orden.gastos?.map(gasto => ({
        ...gasto,
        fecha: gasto.fecha.toISOString(),
      })),
      fotos: orden.fotos?.map(foto => ({
        ...foto,
        fechaHora: foto.fechaHora instanceof Date ? foto.fechaHora.toISOString() : foto.fechaHora,
      })),
    }
    return NextResponse.json(ordenFallback, { status: 201 })
  } catch (error) {
    console.error('Error en POST /api/ordenes:', error)
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido al crear orden'
    const errorStack = error instanceof Error ? error.stack : undefined
    console.error('Detalles del error:', { errorMessage, errorStack, error })
    return NextResponse.json(
      { 
        error: 'Error al crear orden',
        details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
      },
      { status: 500 }
    )
  }
}

