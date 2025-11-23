import { NextRequest, NextResponse } from 'next/server'
import { getSubtareasByPadre } from '@/services/firebase/plantillas-tareas'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const subtareas = await getSubtareasByPadre(params.id)
    return NextResponse.json(subtareas)
  } catch (error) {
    return NextResponse.json(
      { error: 'Error obteniendo subtareas' },
      { status: 500 }
    )
  }
}

