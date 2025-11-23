/**
 * Firebase Admin SDK Configuration
 * Soporta tanto variables de entorno (producción - Vercel) como JSON local (desarrollo)
 * IMPORTANTE: No importar firebase-admin.json directamente para evitar errores en build de Vercel
 */

import { initializeApp, getApps, cert } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'

let serviceAccount: any = null
let initialized = false

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
  // Usar construcción dinámica que webpack no puede analizar estáticamente
  if (typeof window === 'undefined') {
    try {
      const fs = require('fs')
      const path = require('path')
      // Construir el path de forma dinámica para evitar análisis estático
      const libDir = 'lib'
      const fileName = 'firebase-admin' + '.json'
      const jsonPath = path.join(process.cwd(), 'src', libDir, fileName)
      
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

// Inicializar solo una vez
if (!initialized && typeof window === 'undefined') {
  serviceAccount = loadServiceAccount()
  
  if (serviceAccount && !getApps().length) {
    try {
      initializeApp({
        credential: cert(serviceAccount),
      })
      initialized = true
    } catch (error) {
      console.error('Error inicializando Firebase Admin:', error)
    }
  } else if (!serviceAccount && process.env.NODE_ENV !== 'production') {
    console.warn('⚠️  No se encontró configuración de Firebase Admin')
    console.warn('   Configura las variables de entorno en Vercel o el archivo firebase-admin.json localmente')
  }
}

// Exportar db - siempre disponible, se inicializará cuando sea necesario
export const db = getFirestore()
