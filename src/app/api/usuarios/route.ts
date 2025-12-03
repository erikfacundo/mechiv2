import { NextRequest, NextResponse } from 'next/server'
import { getUsuarios, createUsuario } from '@/services/firebase/usuarios'

export async function GET() {
  try {
    const usuarios = await getUsuarios()
    return NextResponse.json(usuarios)
  } catch (error) {
    console.error('Error obteniendo usuarios:', error)
    return NextResponse.json(
      { error: 'Error al obtener usuarios' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { username, password, nombre, apellido, email, activo } = body

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username y password son requeridos' },
        { status: 400 }
      )
    }

    const id = await createUsuario({
      username,
      password,
      nombre,
      apellido,
      email,
      activo: activo ?? true,
      fechaCreacion: new Date(),
    })

    if (!id) {
      return NextResponse.json(
        { error: 'Error al crear usuario' },
        { status: 500 }
      )
    }

    return NextResponse.json({ id, success: true })
  } catch (error: any) {
    console.error('Error creando usuario:', error)
    return NextResponse.json(
      { error: error.message || 'Error al crear usuario' },
      { status: 500 }
    )
  }
}


