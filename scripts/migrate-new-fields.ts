/**
 * Script para migrar los nuevos campos a documentos existentes
 * Actualiza documentos existentes con los nuevos campos opcionales
 * 
 * Ejecutar con: npx ts-node scripts/migrate-new-fields.ts
 */

import { initializeApp, getApps, cert } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import * as fs from 'fs'
import * as path from 'path'
import { fileURLToPath } from 'url'

// Obtener __dirname en ESM
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

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
    // Intentar múltiples rutas posibles
    const possiblePaths = [
      path.join(__dirname, '..', 'src', 'lib', 'firebase-admin.json'),
      path.join(process.cwd(), 'src', 'lib', 'firebase-admin.json'),
      path.resolve(__dirname, '..', 'src', 'lib', 'firebase-admin.json'),
    ]
    
    for (const jsonPath of possiblePaths) {
      if (fs.existsSync(jsonPath)) {
        console.log(`📁 Usando archivo de credenciales: ${jsonPath}`)
        return JSON.parse(fs.readFileSync(jsonPath, 'utf8'))
      }
    }
  } catch (error) {
    // Ignorar error
    console.error('Error al cargar archivo JSON:', error)
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

async function migrateNewFields() {
  try {
    console.log('🚀 Iniciando migración de nuevos campos...\n')

    // 1. Actualizar plantillas_tareas existentes
    console.log('📄 Actualizando plantillas_tareas...')
    const plantillasSnapshot = await db.collection('plantillas_tareas').get()
    let plantillasUpdated = 0

    for (const doc of plantillasSnapshot.docs) {
      const data = doc.data()
      const updates: any = {}

      // Agregar campos nuevos si no existen
      if (data.esTareaPadre === undefined) {
        updates.esTareaPadre = false
      }
      if (data.tareaPadre === undefined) {
        updates.tareaPadre = null
      }
      if (data.subtareas === undefined) {
        updates.subtareas = []
      }
      if (data.usoCount === undefined) {
        updates.usoCount = 0
      }

      if (Object.keys(updates).length > 0) {
        await doc.ref.update(updates)
        plantillasUpdated++
      }
    }

    console.log(`✅ ${plantillasUpdated} plantillas actualizadas\n`)

    // 2. Actualizar categorías existentes
    console.log('📁 Actualizando categorías...')
    const categoriasSnapshot = await db.collection('categorias').get()
    let categoriasUpdated = 0

    for (const doc of categoriasSnapshot.docs) {
      const data = doc.data()
      const updates: any = {}

      // Agregar campo subcategorias si no existe
      if (data.subcategorias === undefined) {
        updates.subcategorias = []
      }

      if (Object.keys(updates).length > 0) {
        await doc.ref.update(updates)
        categoriasUpdated++
      }
    }

    console.log(`✅ ${categoriasUpdated} categorías actualizadas\n`)

    // 3. Actualizar órdenes existentes
    console.log('📋 Actualizando órdenes...')
    const ordenesSnapshot = await db.collection('ordenes').get()
    let ordenesUpdated = 0

    for (const doc of ordenesSnapshot.docs) {
      const data = doc.data()
      const updates: any = {}

      // Agregar campos nuevos si no existen
      if (data.checklist === undefined) {
        updates.checklist = []
      }
      if (data.gastos === undefined) {
        updates.gastos = []
      }
      if (data.porcentajeCompletitud === undefined) {
        // Calcular basado en checklist si existe
        const checklist = data.checklist || []
        updates.porcentajeCompletitud = checklist.length > 0
          ? Math.round((checklist.filter((t: any) => t.completado).length / checklist.length) * 100)
          : 0
      }
      if (data.esMantenimiento === undefined) {
        updates.esMantenimiento = false
      }
      if (data.fechaRecordatorioMantenimiento === undefined) {
        updates.fechaRecordatorioMantenimiento = null
      }

      if (Object.keys(updates).length > 0) {
        await doc.ref.update(updates)
        ordenesUpdated++
      }
    }

    console.log(`✅ ${ordenesUpdated} órdenes actualizadas\n`)

    // 4. Crear colección mantenimientos si no existe
    console.log('🔧 Verificando colección mantenimientos...')
    const mantenimientosSnapshot = await db.collection('mantenimientos').limit(1).get()
    
    if (mantenimientosSnapshot.empty) {
      console.log('   Colección mantenimientos está vacía (esto es normal, se creará automáticamente)')
      console.log('   Se creará cuando se agregue el primer mantenimiento desde la aplicación\n')
    } else {
      console.log('   ✅ Colección mantenimientos ya existe\n')
    }

    console.log('✅ Migración completada exitosamente!')
    console.log('\n📋 Resumen:')
    console.log(`   - Plantillas actualizadas: ${plantillasUpdated}`)
    console.log(`   - Categorías actualizadas: ${categoriasUpdated}`)
    console.log(`   - Órdenes actualizadas: ${ordenesUpdated}`)
    console.log('\n💡 Nota: Los nuevos campos son opcionales y retrocompatibles.')
    console.log('   Los documentos existentes seguirán funcionando sin estos campos.\n')

    process.exit(0)
  } catch (error) {
    console.error('❌ Error durante la migración:', error)
    process.exit(1)
  }
}

migrateNewFields()

