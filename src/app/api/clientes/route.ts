import { NextRequest, NextResponse } from 'next/server'
import { getClientes, createCliente } from '@/services/firebase/clientes'
import { checkDniExists } from '@/services/firebase/validations'
import { Cliente } from '@/types'

export async function GET() {
  try {
    const clientes = await getClientes()
    return NextResponse.json(clientes)
  } catch (error) {
    console.error('Error en GET /api/clientes:', error)
    return NextResponse.json(
      { error: 'Error al obtener clientes' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validar DNI único
    const dniExists = await checkDniExists(body.dni)
    if (dniExists) {
      return NextResponse.json(
        { error: 'El DNI ya está registrado' },
        { status: 400 }
      )
    }

    const cliente: Omit<Cliente, 'id'> = {
      nombre: body.nombre,
      apellido: body.apellido,
      dni: body.dni,
      telefono: body.telefono,
      email: body.email,
      direccion: body.direccion,
      fechaRegistro: new Date(),
    }
    
    const id = await createCliente(cliente)
    
    if (!id) {
      return NextResponse.json(
        { error: 'Error al crear cliente' },
        { status: 500 }
      )
    }
    
    return NextResponse.json({ id, ...cliente }, { status: 201 })
  } catch (error) {
    console.error('Error en POST /api/clientes:', error)
    return NextResponse.json(
      { error: 'Error al crear cliente' },
      { status: 500 }
    )
  }
}

