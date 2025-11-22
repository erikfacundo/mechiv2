import { NextRequest, NextResponse } from 'next/server'
import { getPlantillasTareas, createPlantillaTarea } from '@/services/firebase/plantillas-tareas'
import { PlantillaTarea } from '@/types'

export async function GET() {
  try {
    const plantillas = await getPlantillasTareas()
    return NextResponse.json(plantillas)
  } catch (error) {
    return NextResponse.json(
      { error: 'Error obteniendo plantillas' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const plantilla: Omit<PlantillaTarea, 'id'> = {
      nombre: body.nombre,
      descripcion: body.descripcion || '',
      categoria: body.categoria || '',
      tiempoEstimado: body.tiempoEstimado || 0,
      costoEstimado: body.costoEstimado || 0,
      pasos: body.pasos || [],
      activa: body.activa !== undefined ? body.activa : true,
      fechaCreacion: new Date(),
    }

    const id = await createPlantillaTarea(plantilla)
    if (!id) {
      return NextResponse.json(
        { error: 'Error creando plantilla' },
        { status: 500 }
      )
    }

    return NextResponse.json({ id, ...plantilla }, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Error creando plantilla' },
      { status: 500 }
    )
  }
}

