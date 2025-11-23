/**
 * Script para verificar el estado de Firestore
 * Muestra qué colecciones existen y cuántos documentos tienen
 * 
 * Ejecutar con: npx ts-node scripts/check-firestore.ts
 */

import { initializeApp, getApps, cert } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'

// Función para cargar credenciales
function loadServiceAccount() {
  // Prioridad 1: Variables de entorno
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

  // Prioridad 2: JSON local (solo en desarrollo)
  try {
    const fs = require('fs')
    const path = require('path')
    const jsonPath = path.join(__dirname, '..', 'src', 'lib', 'firebase-admin.json')
    
    if (fs.existsSync(jsonPath)) {
      return JSON.parse(fs.readFileSync(jsonPath, 'utf8'))
    }
  } catch (error) {
    // Ignorar error
  }

  return null
}

// Inicializar Firebase Admin
if (!getApps().length) {
  const serviceAccount = loadServiceAccount()
  if (serviceAccount) {
    initializeApp({
      credential: cert(serviceAccount as any),
    })
  } else {
    console.error('❌ Error: No se encontró configuración de Firebase Admin')
    console.error('   Configura las variables de entorno o el archivo firebase-admin.json')
    process.exit(1)
  }
}

const db = getFirestore()

async function checkFirestore() {
  try {
    console.log('🔍 Verificando estado de Firestore...\n')

    const collections = [
      'categorias',
      'clientes',
      'cobros',
      'gastos',
      'ordenes',
      'plantillas_tareas',
      'proveedores',
      'turnos',
      'vehiculos',
      'configuracion'
    ]

    for (const collectionName of collections) {
      try {
        const snapshot = await db.collection(collectionName).get()
        const count = snapshot.size
        
        if (count > 0) {
          console.log(`✅ ${collectionName}: ${count} documento(s)`)
          
          // Mostrar algunos ejemplos
          if (count <= 3) {
            snapshot.docs.forEach((doc, index) => {
              console.log(`   ${index + 1}. ID: ${doc.id}`)
            })
          } else {
            console.log(`   (mostrando primeros 3 de ${count})`)
            snapshot.docs.slice(0, 3).forEach((doc, index) => {
              console.log(`   ${index + 1}. ID: ${doc.id}`)
            })
          }
        } else {
          console.log(`❌ ${collectionName}: Vacía (0 documentos)`)
        }
      } catch (error: any) {
        if (error.code === 'permission-denied') {
          console.log(`⚠️  ${collectionName}: Sin permisos para leer`)
        } else {
          console.log(`❌ ${collectionName}: Error - ${error.message}`)
        }
      }
    }

    console.log('\n📊 Resumen:')
    const required = [
      'categorias',
      'clientes',
      'cobros',
      'gastos',
      'ordenes',
      'plantillas_tareas',
      'proveedores',
      'turnos',
      'vehiculos'
    ]
    
    let allExist = true
    for (const name of required) {
      try {
        const snapshot = await db.collection(name).limit(1).get()
        if (snapshot.empty) {
          allExist = false
          break
        }
      } catch (error) {
        allExist = false
        break
      }
    }

    if (allExist) {
      console.log('✅ Todas las colecciones requeridas existen')
    } else {
      console.log('⚠️  Faltan algunas colecciones requeridas')
      console.log('   Ejecuta: npm run firestore:init\n')
    }

    process.exit(0)
  } catch (error) {
    console.error('❌ Error verificando Firestore:', error)
    process.exit(1)
  }
}

checkFirestore()

