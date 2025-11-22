import { NextRequest, NextResponse } from 'next/server'
import { getCategoriaById, updateCategoria, deleteCategoria } from '@/services/firebase/categorias'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const categoria = await getCategoriaById(params.id)
    if (!categoria) {
      return NextResponse.json(
        { error: 'Categoría no encontrada' },
        { status: 404 }
      )
    }
    return NextResponse.json(categoria)
  } catch (error) {
    return NextResponse.json(
      { error: 'Error obteniendo categoría' },
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
    const success = await updateCategoria(params.id, body)
    if (!success) {
      return NextResponse.json(
        { error: 'Error actualizando categoría' },
        { status: 500 }
      )
    }
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: 'Error actualizando categoría' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const success = await deleteCategoria(params.id)
    if (!success) {
      return NextResponse.json(
        { error: 'Error eliminando categoría' },
        { status: 500 }
      )
    }
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: 'Error eliminando categoría' },
      { status: 500 }
    )
  }
}

