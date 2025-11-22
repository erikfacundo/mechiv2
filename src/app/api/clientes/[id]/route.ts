import { NextRequest, NextResponse } from 'next/server'
import { getClienteById, updateCliente, deleteCliente } from '@/services/firebase/clientes'
import { checkDniExists } from '@/services/firebase/validations'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const cliente = await getClienteById(params.id)
    
    if (!cliente) {
      return NextResponse.json(
        { error: 'Cliente no encontrado' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(cliente)
  } catch (error) {
    console.error('Error en GET /api/clientes/[id]:', error)
    return NextResponse.json(
      { error: 'Error al obtener cliente' },
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
    
    // Validar DNI único si se está cambiando
    if (body.dni) {
      const dniExists = await checkDniExists(body.dni, params.id)
      if (dniExists) {
        return NextResponse.json(
          { error: 'El DNI ya está registrado' },
          { status: 400 }
        )
      }
    }

    const success = await updateCliente(params.id, body)
    
    if (!success) {
      return NextResponse.json(
        { error: 'Error al actualizar cliente' },
        { status: 500 }
      )
    }
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error en PUT /api/clientes/[id]:', error)
    return NextResponse.json(
      { error: 'Error al actualizar cliente' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const success = await deleteCliente(params.id)
    
    if (!success) {
      return NextResponse.json(
        { error: 'Error al eliminar cliente' },
        { status: 500 }
      )
    }
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error en DELETE /api/clientes/[id]:', error)
    return NextResponse.json(
      { error: 'Error al eliminar cliente' },
      { status: 500 }
    )
  }
}

