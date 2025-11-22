import { NextRequest, NextResponse } from 'next/server'
import { getGastoById, updateGasto, deleteGasto } from '@/services/firebase/gastos'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const gasto = await getGastoById(params.id)
    if (!gasto) {
      return NextResponse.json(
        { error: 'Gasto no encontrado' },
        { status: 404 }
      )
    }
    return NextResponse.json(gasto)
  } catch (error) {
    return NextResponse.json(
      { error: 'Error obteniendo gasto' },
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
    const success = await updateGasto(params.id, body)
    if (!success) {
      return NextResponse.json(
        { error: 'Error actualizando gasto' },
        { status: 500 }
      )
    }
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: 'Error actualizando gasto' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const success = await deleteGasto(params.id)
    if (!success) {
      return NextResponse.json(
        { error: 'Error eliminando gasto' },
        { status: 500 }
      )
    }
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: 'Error eliminando gasto' },
      { status: 500 }
    )
  }
}

