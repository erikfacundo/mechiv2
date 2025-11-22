import { NextRequest, NextResponse } from 'next/server'
import { getProveedores, createProveedor } from '@/services/firebase/proveedores'
import { Proveedor } from '@/types'

export async function GET() {
  try {
    const proveedores = await getProveedores()
    return NextResponse.json(proveedores)
  } catch (error) {
    return NextResponse.json(
      { error: 'Error obteniendo proveedores' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const proveedor: Omit<Proveedor, 'id'> = {
      nombre: body.nombre,
      razonSocial: body.razonSocial || '',
      cuit: body.cuit || '',
      telefono: body.telefono,
      email: body.email || '',
      direccion: body.direccion || '',
      tipo: body.tipo || 'Repuestos',
      activo: body.activo !== undefined ? body.activo : true,
      fechaRegistro: new Date(),
    }

    const id = await createProveedor(proveedor)
    if (!id) {
      return NextResponse.json(
        { error: 'Error creando proveedor' },
        { status: 500 }
      )
    }

    return NextResponse.json({ id, ...proveedor }, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Error creando proveedor' },
      { status: 500 }
    )
  }
}

