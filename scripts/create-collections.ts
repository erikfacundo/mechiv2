/**
 * Script para crear las colecciones vacías en Firestore
 * Útil si solo quieres crear la estructura sin datos
 * 
 * Ejecutar con: npx ts-node scripts/create-collections.ts
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

async function createCollections() {
  try {
    console.log('🚀 Creando colecciones en Firestore...\n')

    // Crear documentos vacíos para inicializar las colecciones
    // Firestore crea las colecciones automáticamente al agregar el primer documento

    const collections = [
      'categorias',
      'clientes',
      'cobros',
      'gastos',
      'mantenimientos', // Nueva colección
      'ordenes',
      'plantillas_tareas',
      'proveedores',
      'turnos',
      'vehiculos'
    ]

    for (const collectionName of collections) {
      const snapshot = await db.collection(collectionName).limit(1).get()
      
      if (snapshot.empty) {
        // Crear un documento temporal que luego se puede eliminar
        const docRef = await db.collection(collectionName).add({
          _temp: true,
          _createdAt: new Date(),
        })
        
        console.log(`✅ Colección '${collectionName}' creada (ID temporal: ${docRef.id})`)
        
        // Opcional: eliminar el documento temporal
        // await docRef.delete()
        // console.log(`   Documento temporal eliminado`)
      } else {
        console.log(`ℹ️  Colección '${collectionName}' ya existe`)
      }
    }

    console.log('\n✅ Colecciones creadas exitosamente!')
    console.log('\n📋 Próximos pasos:')
    console.log('   1. Ejecuta: npx ts-node scripts/init-firestore.ts (para migrar datos)')
    console.log('   2. Crea los índices necesarios (ver README_FIREBASE.md)')
    console.log('   3. Verifica en Firebase Console\n')

    process.exit(0)
  } catch (error) {
    console.error('❌ Error creando colecciones:', error)
    process.exit(1)
  }
}

createCollections()

