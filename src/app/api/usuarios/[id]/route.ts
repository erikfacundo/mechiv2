import { NextRequest, NextResponse } from 'next/server'
import { getUsuarioById, updateUsuario, deleteUsuario } from '@/services/firebase/usuarios'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const usuario = await getUsuarioById(params.id)
    
    if (!usuario) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json(usuario)
  } catch (error) {
    console.error('Error obteniendo usuario:', error)
    return NextResponse.json(
      { error: 'Error al obtener usuario' },
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
    const { username, password, nombre, apellido, email, activo } = body

    const updateData: any = {}
    if (username !== undefined) updateData.username = username
    if (password !== undefined) updateData.password = password
    if (nombre !== undefined) updateData.nombre = nombre
    if (apellido !== undefined) updateData.apellido = apellido
    if (email !== undefined) updateData.email = email
    if (activo !== undefined) updateData.activo = activo

    const success = await updateUsuario(params.id, updateData)

    if (!success) {
      return NextResponse.json(
        { error: 'Error al actualizar usuario' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error actualizando usuario:', error)
    return NextResponse.json(
      { error: 'Error al actualizar usuario' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const success = await deleteUsuario(params.id)

    if (!success) {
      return NextResponse.json(
        { error: 'Error al eliminar usuario' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error eliminando usuario:', error)
    return NextResponse.json(
      { error: 'Error al eliminar usuario' },
      { status: 500 }
    )
  }
}


