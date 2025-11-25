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
    
    // Serializar fechas a ISO strings para JSON
    const ordenSerializada = {
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
    }
    
    return NextResponse.json(ordenSerializada)
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

    // Si es mantenimiento y tiene fecha de recordatorio, crear/actualizar el mantenimiento
    if (body.esMantenimiento && body.fechaRecordatorioMantenimiento) {
      const { getMantenimientos, createMantenimiento, updateMantenimiento } = await import('@/services/firebase/mantenimientos')
      const mantenimientos = await getMantenimientos()
      const mantenimientoExistente = mantenimientos.find(m => m.ordenId === params.id)
      
      if (mantenimientoExistente) {
        await updateMantenimiento(mantenimientoExistente.id, {
          fechaRecordatorio: new Date(body.fechaRecordatorioMantenimiento),
          observaciones: body.observaciones || mantenimientoExistente.observaciones,
        })
      } else {
        const orden = await getOrdenById(params.id)
        if (orden) {
          await createMantenimiento({
            ordenId: params.id,
            clienteId: orden.clienteId,
            vehiculoId: orden.vehiculoId,
            fechaRecordatorio: new Date(body.fechaRecordatorioMantenimiento),
            completado: false,
            observaciones: `Recordatorio de mantenimiento para orden ${orden.numeroOrden}`,
            fechaCreacion: new Date(),
          })
        }
      }
    }

    const success = await updateOrden(params.id, body)
    
    if (!success) {
      return NextResponse.json(
        { error: 'Error al actualizar orden' },
        { status: 500 }
      )
    }
    
    const ordenActualizada = await getOrdenById(params.id)
    
    if (!ordenActualizada) {
      return NextResponse.json(
        { error: 'Orden no encontrada' },
        { status: 404 }
      )
    }
    
    // Serializar fechas a ISO strings para JSON
    const ordenSerializada = {
      ...ordenActualizada,
      fechaIngreso: ordenActualizada.fechaIngreso.toISOString(),
      fechaEntrega: ordenActualizada.fechaEntrega?.toISOString(),
      fechaRecordatorioMantenimiento: ordenActualizada.fechaRecordatorioMantenimiento?.toISOString(),
      checklist: ordenActualizada.checklist?.map(item => ({
        ...item,
        fechaCompletitud: item.fechaCompletitud?.toISOString(),
      })),
      gastos: ordenActualizada.gastos?.map(gasto => ({
        ...gasto,
        fecha: gasto.fecha.toISOString(),
      })),
      fotos: ordenActualizada.fotos?.map(foto => ({
        ...foto,
        fechaHora: foto.fechaHora.toISOString(),
      })),
    }
    
    return NextResponse.json(ordenSerializada)
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

