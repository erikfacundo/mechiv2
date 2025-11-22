/**
 * Script para verificar el estado de Firestore
 * Muestra qué colecciones existen y cuántos documentos tienen
 * 
 * Ejecutar con: npx ts-node scripts/check-firestore.ts
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

