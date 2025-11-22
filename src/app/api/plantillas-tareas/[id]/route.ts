import { NextRequest, NextResponse } from 'next/server'
import { getPlantillaTareaById, updatePlantillaTarea, deletePlantillaTarea } from '@/services/firebase/plantillas-tareas'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const plantilla = await getPlantillaTareaById(params.id)
    if (!plantilla) {
      return NextResponse.json(
        { error: 'Plantilla no encontrada' },
        { status: 404 }
      )
    }
    return NextResponse.json(plantilla)
  } catch (error) {
    return NextResponse.json(
      { error: 'Error obteniendo plantilla' },
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
    const success = await updatePlantillaTarea(params.id, body)
    if (!success) {
      return NextResponse.json(
        { error: 'Error actualizando plantilla' },
        { status: 500 }
      )
    }
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: 'Error actualizando plantilla' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const success = await deletePlantillaTarea(params.id)
    if (!success) {
      return NextResponse.json(
        { error: 'Error eliminando plantilla' },
        { status: 500 }
      )
    }
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: 'Error eliminando plantilla' },
      { status: 500 }
    )
  }
}

