/**
 * Firebase Admin SDK Configuration
 * Soporta tanto variables de entorno (producción - Vercel) como JSON local (desarrollo)
 * IMPORTANTE: No importar firebase-admin.json directamente para evitar errores en build de Vercel
 */

import { initializeApp, getApps, cert } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'

let serviceAccount: any = null
let dbInstance: ReturnType<typeof getFirestore> | null = null

// Función para cargar credenciales de forma segura (sin que webpack lo detecte)
function loadServiceAccount() {
  // Prioridad 1: Variables de entorno (producción - Vercel)
  const requiredVars = [
    'FIREBASE_PROJECT_ID',
    'FIREBASE_PRIVATE_KEY_ID',
    'FIREBASE_PRIVATE_KEY',
    'FIREBASE_CLIENT_EMAIL',
    'FIREBASE_CLIENT_ID',
    'FIREBASE_CLIENT_X509_CERT_URL'
  ]
  
  // Verificar que todas las variables estén presentes
  const missingVars = requiredVars.filter(varName => !process.env[varName])
  
  if (missingVars.length > 0) {
    if (process.env.VERCEL || process.env.NODE_ENV === 'production') {
      console.error('❌ Variables de Firebase faltantes en Vercel:', missingVars.join(', '))
      console.error('   Verifica que todas las variables estén configuradas en el dashboard de Vercel')
    }
    return null
  }
  
  // Todas las variables están presentes
  return {
    type: 'service_account',
    project_id: process.env.FIREBASE_PROJECT_ID!,
    private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID!,
    private_key: process.env.FIREBASE_PRIVATE_KEY!.replace(/\\n/g, '\n'),
    client_email: process.env.FIREBASE_CLIENT_EMAIL!,
    client_id: process.env.FIREBASE_CLIENT_ID!,
    auth_uri: 'https://accounts.google.com/o/oauth2/auth',
    token_uri: 'https://oauth2.googleapis.com/token',
    auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
    client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL!,
  }

  // Prioridad 2: JSON local (solo en desarrollo, solo en servidor)
  // IMPORTANTE: Solo intentar en desarrollo, nunca en producción
  if (typeof window === 'undefined' && process.env.NODE_ENV !== 'production') {
    try {
      // Usar require dinámico con variables para evitar análisis estático de webpack
      const fs = require('fs')
      const path = require('path')
      // Construir el path completamente dinámico usando variables
      const baseDir = process.cwd()
      const dir1 = 'src'
      const dir2 = 'lib'
      const file = 'firebase-admin' + '.json'
      const jsonPath = path.join(baseDir, dir1, dir2, file)
      
      if (fs.existsSync(jsonPath)) {
        const fileContent = fs.readFileSync(jsonPath, 'utf8')
        const jsonData = JSON.parse(fileContent)
        return {
          type: 'service_account',
          project_id: jsonData.project_id,
          private_key_id: jsonData.private_key_id,
          private_key: jsonData.private_key,
          client_email: jsonData.client_email,
          client_id: jsonData.client_id,
          auth_uri: jsonData.auth_uri || 'https://accounts.google.com/o/oauth2/auth',
          token_uri: jsonData.token_uri || 'https://oauth2.googleapis.com/token',
          auth_provider_x509_cert_url: jsonData.auth_provider_x509_cert_url || 'https://www.googleapis.com/oauth2/v1/certs',
          client_x509_cert_url: jsonData.client_x509_cert_url,
        }
      }
    } catch (error) {
      // Silenciar error - es normal en producción donde el archivo no existe
    }
  }

  return null
}

// Función para inicializar Firebase Admin de forma lazy
function getDbInstance() {
  if (dbInstance) {
    return dbInstance
  }

  // Solo inicializar si no hay apps ya inicializadas
  if (getApps().length === 0) {
    serviceAccount = loadServiceAccount()
    
    if (serviceAccount) {
      try {
        initializeApp({
          credential: cert(serviceAccount),
        })
        dbInstance = getFirestore()
        if (process.env.VERCEL || process.env.NODE_ENV === 'production') {
          console.log('✅ Firebase Admin inicializado correctamente en producción')
        }
        return dbInstance
      } catch (error) {
        console.error('❌ Error inicializando Firebase Admin:', error)
        if (error instanceof Error) {
          console.error('   Detalles:', error.message)
        }
        // No lanzar error aquí, permitir que se intente más tarde
      }
      } else {
      const isProduction = process.env.VERCEL || process.env.NODE_ENV === 'production'
      if (isProduction) {
        console.error('❌ Firebase Admin no configurado en producción')
        console.error('   Verifica las variables de entorno en Vercel')
      } else {
        console.warn('⚠️  No se encontró configuración de Firebase Admin')
        console.warn('   Configura las variables de entorno en Vercel o el archivo firebase-admin.json localmente')
      }
    }
  }
  
  // Intentar obtener la instancia (puede fallar si no hay credenciales)
  try {
    dbInstance = getFirestore()
    return dbInstance
  } catch (error) {
    // En build sin credenciales, esto puede fallar
    // Pero permitirá que el build pase y fallará en runtime
    const errorMsg = process.env.VERCEL 
      ? 'Firebase Admin no está inicializado. Verifica que todas las variables de entorno estén configuradas en Vercel: FIREBASE_PROJECT_ID, FIREBASE_PRIVATE_KEY_ID, FIREBASE_PRIVATE_KEY, FIREBASE_CLIENT_EMAIL, FIREBASE_CLIENT_ID, FIREBASE_CLIENT_X509_CERT_URL'
      : 'Firebase Admin no está inicializado. Configura las variables de entorno en Vercel.'
    throw new Error(errorMsg)
  }
}

// Exportar db con lazy initialization
export const db = new Proxy({} as ReturnType<typeof getFirestore>, {
  get(target, prop) {
    const instance = getDbInstance()
    const value = (instance as any)[prop]
    return typeof value === 'function' ? value.bind(instance) : value
  }
})
