import { NextRequest, NextResponse } from 'next/server'
import { checkPatenteExists } from '@/services/firebase/validations'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const patente = searchParams.get('patente')
  const excludeId = searchParams.get('excludeId')

  if (!patente) {
    return NextResponse.json({ error: 'Patente requerida' }, { status: 400 })
  }

  const exists = await checkPatenteExists(patente, excludeId || undefined)
  return NextResponse.json({ exists })
}

