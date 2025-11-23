import { NextRequest, NextResponse } from 'next/server'
import { incrementPlantillaUsage } from '@/services/firebase/plantillas-tareas'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const success = await incrementPlantillaUsage(params.id)
    if (!success) {
      return NextResponse.json(
        { error: 'Error incrementando uso de plantilla' },
        { status: 500 }
      )
    }
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: 'Error incrementando uso de plantilla' },
      { status: 500 }
    )
  }
}

