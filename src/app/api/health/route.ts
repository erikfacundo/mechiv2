import { NextResponse } from 'next/server'

/**
 * Endpoint de diagnóstico para verificar configuración
 * GET /api/health
 */
export async function GET() {
  const health: {
    status: 'ok' | 'error'
    firebase: {
      configured: boolean
      missingVars: string[]
      presentVars: string[]
      privateKeyFormat: 'ok' | 'error' | 'unknown'
    }
    r2: {
      configured: boolean
      missingVars: string[]
      presentVars: string[]
    }
    environment: string
    vercel: boolean
    message?: string
  } = {
    status: 'ok',
    firebase: {
      configured: false,
      missingVars: [],
      presentVars: [],
      privateKeyFormat: 'unknown',
    },
    r2: {
      configured: false,
      missingVars: [],
      presentVars: [],
    },
    environment: process.env.NODE_ENV || 'unknown',
    vercel: !!process.env.VERCEL,
  }

  // Verificar Firebase
  const firebaseVars = [
    'FIREBASE_PROJECT_ID',
    'FIREBASE_PRIVATE_KEY_ID',
    'FIREBASE_PRIVATE_KEY',
    'FIREBASE_CLIENT_EMAIL',
    'FIREBASE_CLIENT_ID',
    'FIREBASE_CLIENT_X509_CERT_URL',
  ]

  firebaseVars.forEach((varName) => {
    if (process.env[varName]) {
      health.firebase.presentVars.push(varName)
    } else {
      health.firebase.missingVars.push(varName)
    }
  })

  health.firebase.configured = health.firebase.missingVars.length === 0

  // Verificar formato de FIREBASE_PRIVATE_KEY
  if (process.env.FIREBASE_PRIVATE_KEY) {
    const privateKey = process.env.FIREBASE_PRIVATE_KEY
    if (privateKey.includes('\\n') || privateKey.includes('\n')) {
      health.firebase.privateKeyFormat = 'ok'
    } else if (privateKey.includes('BEGIN PRIVATE KEY') && privateKey.includes('END PRIVATE KEY')) {
      // Tiene el formato pero puede que falten los \n
      health.firebase.privateKeyFormat = 'error'
      health.message = 'FIREBASE_PRIVATE_KEY parece tener saltos de línea incorrectos. Debe tener \\n (backslash n) para los saltos de línea.'
    } else {
      health.firebase.privateKeyFormat = 'error'
    }
  }

  // Verificar R2
  const r2Vars = [
    'R2_ACCOUNT_ID',
    'R2_ACCESS_KEY_ID',
    'R2_SECRET_ACCESS_KEY',
    'R2_BUCKET_NAME',
  ]

  r2Vars.forEach((varName) => {
    if (process.env[varName]) {
      health.r2.presentVars.push(varName)
    } else {
      health.r2.missingVars.push(varName)
    }
  })

  health.r2.configured = health.r2.missingVars.length === 0

  // Determinar estado general
  if (!health.firebase.configured || !health.r2.configured || health.firebase.privateKeyFormat === 'error') {
    health.status = 'error'
    
    // Mensaje de ayuda
    if (!health.firebase.configured) {
      health.message = `Faltan variables de Firebase: ${health.firebase.missingVars.join(', ')}`
    } else if (!health.r2.configured) {
      health.message = `Faltan variables de R2: ${health.r2.missingVars.join(', ')}. Ve a Cloudflare Dashboard → R2 → Manage R2 API Tokens para obtener R2_ACCOUNT_ID y R2_ACCESS_KEY_ID`
    } else if (health.firebase.privateKeyFormat === 'error') {
      health.message = 'El formato de FIREBASE_PRIVATE_KEY es incorrecto. Debe tener \\n (backslash n) para los saltos de línea, no saltos de línea reales.'
    }
  } else {
    health.message = '✅ Todas las variables están configuradas correctamente'
  }

  return NextResponse.json(health, {
    status: health.status === 'ok' ? 200 : 503,
  })
}

