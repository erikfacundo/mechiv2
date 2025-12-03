import { NextRequest, NextResponse } from 'next/server'
import { uploadImageToR2, base64ToBuffer } from '@/lib/r2-storage'
import { resizeAndCompressImage } from '@/lib/image-utils'

/**
 * API Route para subir imágenes a Cloudflare R2
 * POST /api/upload
 * Body: { image: string (base64), fileName?: string }
 */
export async function POST(request: NextRequest) {
  try {
    // Verificar que R2 está configurado
    if (!process.env.R2_ACCOUNT_ID || !process.env.R2_ACCESS_KEY_ID || !process.env.R2_SECRET_ACCESS_KEY) {
      return NextResponse.json(
        { error: 'R2 storage not configured' },
        { status: 500 }
      )
    }

    const body = await request.json()
    const { image, fileName } = body

    if (!image || typeof image !== 'string') {
      return NextResponse.json(
        { error: 'Image data is required' },
        { status: 400 }
      )
    }

    // Si la imagen viene como base64, procesarla primero
    let imageBuffer: Buffer
    let contentType = 'image/jpeg'

    if (image.startsWith('data:')) {
      // Es un data URL completo
      const matches = image.match(/^data:([^;]+);base64,(.+)$/)
      if (matches) {
        contentType = matches[1] || 'image/jpeg'
        imageBuffer = Buffer.from(matches[2], 'base64')
      } else {
        // Solo base64 sin prefijo
        imageBuffer = base64ToBuffer(image)
      }
    } else {
      // Ya es base64 puro
      imageBuffer = base64ToBuffer(image)
    }

    // Generar nombre de archivo único
    const timestamp = Date.now()
    const randomStr = Math.random().toString(36).substring(2, 9)
    const extension = contentType.includes('png') ? 'png' : 'jpg'
    const finalFileName = fileName || `image-${timestamp}-${randomStr}.${extension}`

    // Subir a R2
    const publicUrl = await uploadImageToR2(imageBuffer, finalFileName, contentType)

    return NextResponse.json({
      success: true,
      url: publicUrl,
      fileName: finalFileName,
    })
  } catch (error) {
    console.error('Error uploading image to R2:', error)
    return NextResponse.json(
      { 
        error: 'Failed to upload image',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/upload?url=...
 * Elimina una imagen de R2
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const imageUrl = searchParams.get('url')

    if (!imageUrl) {
      return NextResponse.json(
        { error: 'Image URL is required' },
        { status: 400 }
      )
    }

    const { deleteImageFromR2 } = await import('@/lib/r2-storage')
    await deleteImageFromR2(imageUrl)

    return NextResponse.json({
      success: true,
      message: 'Image deleted successfully',
    })
  } catch (error) {
    console.error('Error deleting image from R2:', error)
    return NextResponse.json(
      { 
        error: 'Failed to delete image',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

