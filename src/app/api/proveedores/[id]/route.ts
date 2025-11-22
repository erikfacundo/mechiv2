import { NextRequest, NextResponse } from 'next/server'
import { getProveedorById, updateProveedor, deleteProveedor } from '@/services/firebase/proveedores'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const proveedor = await getProveedorById(params.id)
    if (!proveedor) {
      return NextResponse.json(
        { error: 'Proveedor no encontrado' },
        { status: 404 }
      )
    }
    return NextResponse.json(proveedor)
  } catch (error) {
    return NextResponse.json(
      { error: 'Error obteniendo proveedor' },
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
    const success = await updateProveedor(params.id, body)
    if (!success) {
      return NextResponse.json(
        { error: 'Error actualizando proveedor' },
        { status: 500 }
      )
    }
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: 'Error actualizando proveedor' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const success = await deleteProveedor(params.id)
    if (!success) {
      return NextResponse.json(
        { error: 'Error eliminando proveedor' },
        { status: 500 }
      )
    }
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: 'Error eliminando proveedor' },
      { status: 500 }
    )
  }
}

