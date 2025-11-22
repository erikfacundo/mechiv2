import { NextRequest, NextResponse } from 'next/server'
import { checkDniExists } from '@/services/firebase/validations'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const dni = searchParams.get('dni')
  const excludeId = searchParams.get('excludeId')

  if (!dni) {
    return NextResponse.json({ error: 'DNI requerido' }, { status: 400 })
  }

  const exists = await checkDniExists(dni, excludeId || undefined)
  return NextResponse.json({ exists })
}

