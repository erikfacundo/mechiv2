import { NextRequest, NextResponse } from 'next/server'
import { getCobroById, updateCobro, deleteCobro } from '@/services/firebase/cobros'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const cobro = await getCobroById(params.id)
    if (!cobro) {
      return NextResponse.json(
        { error: 'Cobro no encontrado' },
        { status: 404 }
      )
    }
    return NextResponse.json(cobro)
  } catch (error) {
    return NextResponse.json(
      { error: 'Error obteniendo cobro' },
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
    const success = await updateCobro(params.id, body)
    if (!success) {
      return NextResponse.json(
        { error: 'Error actualizando cobro' },
        { status: 500 }
      )
    }
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: 'Error actualizando cobro' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const success = await deleteCobro(params.id)
    if (!success) {
      return NextResponse.json(
        { error: 'Error eliminando cobro' },
        { status: 500 }
      )
    }
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: 'Error eliminando cobro' },
      { status: 500 }
    )
  }
}

