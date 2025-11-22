import { NextRequest, NextResponse } from 'next/server'
import { checkNumeroOrdenExists } from '@/services/firebase/validations'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const numeroOrden = searchParams.get('numeroOrden')
  const excludeId = searchParams.get('excludeId')

  if (!numeroOrden) {
    return NextResponse.json({ error: 'Número de orden requerido' }, { status: 400 })
  }

  const exists = await checkNumeroOrdenExists(numeroOrden, excludeId || undefined)
  return NextResponse.json({ exists })
}

