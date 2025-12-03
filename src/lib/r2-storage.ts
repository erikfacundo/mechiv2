/**
 * Cloudflare R2 Storage Service
 * Compatible con S3 API
 * 
 * Plan gratuito: 10 GB de almacenamiento, sin costos de egress
 */

import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

// Configuración del cliente S3 para Cloudflare R2
function getR2Client() {
  const accountId = process.env.R2_ACCOUNT_ID
  const accessKeyId = process.env.R2_ACCESS_KEY_ID
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY

  if (!accountId || !accessKeyId || !secretAccessKey) {
    throw new Error('R2 credentials not configured')
  }

  return new S3Client({
    region: 'auto', // R2 usa 'auto' como región
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  })
}

const BUCKET_NAME = process.env.R2_BUCKET_NAME || 'mechify-fotos'

/**
 * Sube una imagen a R2 y retorna la URL pública
 */
export async function uploadImageToR2(
  file: Buffer | Uint8Array,
  fileName: string,
  contentType: string = 'image/jpeg'
): Promise<string> {
  const r2Client = getR2Client()
  const key = `fotos/${Date.now()}-${fileName}`

  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    Body: file,
    ContentType: contentType,
    // Hacer público el objeto (opcional, depende de tu configuración)
    // ACL: 'public-read', // R2 no soporta ACL, usa public access policy
  })

  await r2Client.send(command)

  // Retornar URL pública
  // Si tienes un dominio personalizado configurado en R2, úsalo aquí
  const publicUrl = process.env.R2_PUBLIC_URL 
    ? `${process.env.R2_PUBLIC_URL}/${key}`
    : `https://pub-${process.env.R2_ACCOUNT_ID}.r2.dev/${key}`

  return publicUrl
}

/**
 * Elimina una imagen de R2
 */
export async function deleteImageFromR2(imageUrl: string): Promise<void> {
  const r2Client = getR2Client()

  // Extraer la key de la URL
  // La URL puede ser: https://pub-xxxxx.r2.dev/fotos/timestamp-filename
  // o: https://custom-domain.com/fotos/timestamp-filename
  const urlParts = imageUrl.split('/')
  const key = urlParts.slice(-2).join('/') // 'fotos/timestamp-filename'

  const command = new DeleteObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
  })

  await r2Client.send(command)
}

/**
 * Genera una URL firmada temporal para acceso privado (opcional)
 */
export async function getSignedImageUrl(key: string, expiresIn: number = 3600): Promise<string> {
  const r2Client = getR2Client()
  const command = new GetObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
  })

  return await getSignedUrl(r2Client, command, { expiresIn })
}

/**
 * Convierte base64 a Buffer
 */
export function base64ToBuffer(base64: string): Buffer {
  // Remover el prefijo data:image/...;base64, si existe
  const base64Data = base64.includes(',') ? base64.split(',')[1] : base64
  return Buffer.from(base64Data, 'base64')
}

/**
 * Verifica si una URL es de R2
 */
export function isR2Url(url: string): boolean {
  if (url.includes('r2.dev') || url.includes('r2.cloudflarestorage.com')) {
    return true
  }
  if (process.env.R2_PUBLIC_URL && url.startsWith(process.env.R2_PUBLIC_URL)) {
    return true
  }
  return false
}

