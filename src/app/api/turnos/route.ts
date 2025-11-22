import { NextRequest, NextResponse } from 'next/server'
import { getTurnos, createTurno, getTurnosByFecha } from '@/services/firebase/turnos'
import { Turno } from '@/types'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const fecha = searchParams.get('fecha')

    if (fecha) {
      const turnos = await getTurnosByFecha(new Date(fecha))
      return NextResponse.json(turnos)
    }

    const turnos = await getTurnos()
    return NextResponse.json(turnos)
  } catch (error) {
    return NextResponse.json(
      { error: 'Error obteniendo turnos' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const turno: Omit<Turno, 'id'> = {
      clienteId: body.clienteId,
      vehiculoId: body.vehiculoId,
      fecha: new Date(body.fecha || Date.now()),
      hora: body.hora,
      descripcion: body.descripcion,
      estado: body.estado || 'Pendiente',
      observaciones: body.observaciones || '',
      fechaCreacion: new Date(),
    }

    const id = await createTurno(turno)
    if (!id) {
      return NextResponse.json(
        { error: 'Error creando turno' },
        { status: 500 }
      )
    }

    return NextResponse.json({ id, ...turno }, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Error creando turno' },
      { status: 500 }
    )
  }
}

