/**
 * Script para crear las colecciones faltantes (cobros, gastos, turnos)
 */

import { initializeApp, getApps, cert } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import serviceAccount from '../src/lib/firebase-admin.json'

// Inicializar Firebase Admin
if (!getApps().length) {
  initializeApp({
    credential: cert(serviceAccount as any),
  })
}

const db = getFirestore()

async function createMissingCollections() {
  try {
    console.log('🚀 Creando colecciones faltantes...\n')

    const missingCollections = ['cobros', 'gastos', 'turnos']

    for (const collectionName of missingCollections) {
      try {
        // Verificar si existe
        const snapshot = await db.collection(collectionName).limit(1).get()
        
        if (snapshot.empty) {
          // Crear un documento temporal para inicializar la colección
          const docRef = await db.collection(collectionName).add({
            _temp: true,
            _createdAt: new Date(),
            _note: 'Documento temporal - puede ser eliminado'
          })
          
          console.log(`✅ Colección '${collectionName}' creada (ID temporal: ${docRef.id})`)
          
          // Eliminar el documento temporal
          await docRef.delete()
          console.log(`   Documento temporal eliminado - colección lista para usar`)
        } else {
          console.log(`ℹ️  Colección '${collectionName}' ya existe con ${snapshot.size} documento(s)`)
        }
      } catch (error: any) {
        console.error(`❌ Error creando '${collectionName}':`, error.message)
      }
    }

    console.log('\n✅ Proceso completado!')
    console.log('\n📋 Verifica en Firebase Console que todas las colecciones existan:\n')
    missingCollections.forEach(col => {
      console.log(`   - ${col}`)
    })
    console.log()

    process.exit(0)
  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  }
}

createMissingCollections()

