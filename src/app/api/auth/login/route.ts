import { NextRequest, NextResponse } from 'next/server'

const VALID_USERNAME = 'admteam'
const VALID_PASSWORD = 'gandara 3368'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { username, password } = body

    if (username === VALID_USERNAME && password === VALID_PASSWORD) {
      // En producción, usar JWT o sesiones seguras
      return NextResponse.json({ 
        success: true,
        message: 'Login exitoso'
      })
    }

    return NextResponse.json(
      { error: 'Credenciales inválidas' },
      { status: 401 }
    )
  } catch (error) {
    return NextResponse.json(
      { error: 'Error en el servidor' },
      { status: 500 }
    )
  }
}

