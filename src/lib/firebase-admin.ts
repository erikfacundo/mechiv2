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
  if (process.env.FIREBASE_PROJECT_ID) {
    return {
      type: 'service_account',
      project_id: process.env.FIREBASE_PROJECT_ID,
      private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
      private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      client_email: process.env.FIREBASE_CLIENT_EMAIL,
      client_id: process.env.FIREBASE_CLIENT_ID,
      auth_uri: 'https://accounts.google.com/o/oauth2/auth',
      token_uri: 'https://oauth2.googleapis.com/token',
      auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
      client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL,
    }
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
        return JSON.parse(fileContent)
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
        return dbInstance
      } catch (error) {
        console.error('Error inicializando Firebase Admin:', error)
      }
    } else if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
      console.warn('⚠️  No se encontró configuración de Firebase Admin')
      console.warn('   Configura las variables de entorno en Vercel o el archivo firebase-admin.json localmente')
    }
  }
  
  // Intentar obtener la instancia (puede fallar si no hay credenciales)
  try {
    dbInstance = getFirestore()
    return dbInstance
  } catch (error) {
    // En build sin credenciales, esto puede fallar
    // Pero permitirá que el build pase y fallará en runtime
    throw new Error('Firebase Admin no está inicializado. Configura las variables de entorno en Vercel.')
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
