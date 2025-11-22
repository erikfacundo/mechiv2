import { NextRequest, NextResponse } from 'next/server'
import { getCobros, createCobro } from '@/services/firebase/cobros'
import { Cobro } from '@/types'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const ordenId = searchParams.get('ordenId')

    if (ordenId) {
      const { getCobrosByOrden } = await import('@/services/firebase/cobros')
      const cobros = await getCobrosByOrden(ordenId)
      return NextResponse.json(cobros)
    }

    const cobros = await getCobros()
    return NextResponse.json(cobros)
  } catch (error) {
    return NextResponse.json(
      { error: 'Error obteniendo cobros' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const cobro: Omit<Cobro, 'id'> = {
      ordenId: body.ordenId,
      clienteId: body.clienteId,
      monto: body.monto,
      fecha: new Date(body.fecha || Date.now()),
      metodoPago: body.metodoPago || 'Efectivo',
      estado: body.estado || 'Pendiente',
      numeroComprobante: body.numeroComprobante || '',
      observaciones: body.observaciones || '',
    }

    const id = await createCobro(cobro)
    if (!id) {
      return NextResponse.json(
        { error: 'Error creando cobro' },
        { status: 500 }
      )
    }

    return NextResponse.json({ id, ...cobro }, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Error creando cobro' },
      { status: 500 }
    )
  }
}

