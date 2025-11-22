import { NextRequest, NextResponse } from 'next/server'
import { getGastos, createGasto } from '@/services/firebase/gastos'
import { Gasto } from '@/types'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const proveedorId = searchParams.get('proveedorId')

    if (proveedorId) {
      const { getGastosByProveedor } = await import('@/services/firebase/gastos')
      const gastos = await getGastosByProveedor(proveedorId)
      return NextResponse.json(gastos)
    }

    const gastos = await getGastos()
    return NextResponse.json(gastos)
  } catch (error) {
    return NextResponse.json(
      { error: 'Error obteniendo gastos' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const gasto: Omit<Gasto, 'id'> = {
      proveedorId: body.proveedorId || '',
      categoria: body.categoria,
      descripcion: body.descripcion,
      monto: body.monto,
      fecha: new Date(body.fecha || Date.now()),
      metodoPago: body.metodoPago || 'Efectivo',
      numeroComprobante: body.numeroComprobante || '',
      observaciones: body.observaciones || '',
    }

    const id = await createGasto(gasto)
    if (!id) {
      return NextResponse.json(
        { error: 'Error creando gasto' },
        { status: 500 }
      )
    }

    return NextResponse.json({ id, ...gasto }, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Error creando gasto' },
      { status: 500 }
    )
  }
}

