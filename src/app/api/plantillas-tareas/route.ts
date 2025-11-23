import { NextRequest, NextResponse } from 'next/server'
import { 
  getPlantillasTareas, 
  createPlantillaTarea,
  getPlantillasPadre,
  getMostUsedPlantillas,
  findOrCreatePlantilla,
  incrementPlantillaUsage
} from '@/services/firebase/plantillas-tareas'
import { PlantillaTarea } from '@/types'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const tipo = searchParams.get('tipo')
    
    if (tipo === 'padre') {
      const plantillas = await getPlantillasPadre()
      return NextResponse.json(plantillas)
    }
    
    if (tipo === 'mas-usadas') {
      const limit = parseInt(searchParams.get('limit') || '10')
      const plantillas = await getMostUsedPlantillas(limit)
      return NextResponse.json(plantillas)
    }
    
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
    
    // Si viene findOrCreate, usar la función retroactiva
    if (body.findOrCreate) {
      const id = await findOrCreatePlantilla(
        body.nombre,
        body.tareaPadre,
        body.categoria
      )
      if (!id) {
        return NextResponse.json(
          { error: 'Error creando o encontrando plantilla' },
          { status: 500 }
        )
      }
      // Retornar la plantilla creada o encontrada
      const { getPlantillaTareaById } = await import('@/services/firebase/plantillas-tareas')
      const plantilla = await getPlantillaTareaById(id)
      return NextResponse.json(plantilla, { status: 201 })
    }
    
    const plantilla: Omit<PlantillaTarea, 'id'> = {
      nombre: body.nombre,
      descripcion: body.descripcion || '',
      categoria: body.categoria || '',
      tiempoEstimado: body.tiempoEstimado || 0,
      costoEstimado: body.costoEstimado || 0,
      pasos: body.pasos || [],
      activa: body.activa !== undefined ? body.activa : true,
      fechaCreacion: new Date(),
      tareaPadre: body.tareaPadre || undefined,
      subtareas: body.subtareas || [],
      esTareaPadre: body.esTareaPadre || false,
      usoCount: body.usoCount || 0,
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

