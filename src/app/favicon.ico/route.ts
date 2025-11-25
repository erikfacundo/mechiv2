import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export async function GET(request: NextRequest) {
  try {
    // Intentar servir el favicon desde la raíz de public
    const faviconPath = path.join(process.cwd(), 'public', 'favicon.ico')
    
    if (fs.existsSync(faviconPath)) {
      const fileBuffer = fs.readFileSync(faviconPath)
      return new NextResponse(fileBuffer, {
        headers: {
          'Content-Type': 'image/x-icon',
          'Cache-Control': 'public, max-age=31536000, immutable',
        },
      })
    }
    
    // Si no existe, servir el favicon por defecto desde black-logo
    const defaultFaviconPath = path.join(process.cwd(), 'public', 'logo', 'black-logo', 'favicon.ico')
    if (fs.existsSync(defaultFaviconPath)) {
      const fileBuffer = fs.readFileSync(defaultFaviconPath)
      return new NextResponse(fileBuffer, {
        headers: {
          'Content-Type': 'image/x-icon',
          'Cache-Control': 'public, max-age=31536000, immutable',
        },
      })
    }
    
    return new NextResponse('Favicon not found', { status: 404 })
  } catch (error) {
    console.error('Error serving favicon:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

