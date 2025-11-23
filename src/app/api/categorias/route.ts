import { NextRequest, NextResponse } from 'next/server'
import { getCategorias, createCategoria } from '@/services/firebase/categorias'
import { Categoria } from '@/types'

export async function GET() {
  try {
    const categorias = await getCategorias()
    return NextResponse.json(categorias)
  } catch (error) {
    return NextResponse.json(
      { error: 'Error obteniendo categorías' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const categoria: Omit<Categoria, 'id'> = {
      nombre: body.nombre,
      descripcion: body.descripcion || '',
      color: body.color || '#3b82f6',
      activa: body.activa !== undefined ? body.activa : true,
      fechaCreacion: new Date(),
      subcategorias: body.subcategorias || [], // Incluir subcategorías si vienen en el body
    }

    const id = await createCategoria(categoria)
    if (!id) {
      return NextResponse.json(
        { error: 'Error creando categoría' },
        { status: 500 }
      )
    }

    return NextResponse.json({ id, ...categoria }, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Error creando categoría' },
      { status: 500 }
    )
  }
}

