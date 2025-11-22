import { NextRequest, NextResponse } from 'next/server'
import { getTurnoById, updateTurno, deleteTurno } from '@/services/firebase/turnos'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const turno = await getTurnoById(params.id)
    if (!turno) {
      return NextResponse.json(
        { error: 'Turno no encontrado' },
        { status: 404 }
      )
    }
    return NextResponse.json(turno)
  } catch (error) {
    return NextResponse.json(
      { error: 'Error obteniendo turno' },
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
    const success = await updateTurno(params.id, body)
    if (!success) {
      return NextResponse.json(
        { error: 'Error actualizando turno' },
        { status: 500 }
      )
    }
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: 'Error actualizando turno' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const success = await deleteTurno(params.id)
    if (!success) {
      return NextResponse.json(
        { error: 'Error eliminando turno' },
        { status: 500 }
      )
    }
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: 'Error eliminando turno' },
      { status: 500 }
    )
  }
}

