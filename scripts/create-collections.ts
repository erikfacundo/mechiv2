/**
 * Script para crear las colecciones vacías en Firestore
 * Útil si solo quieres crear la estructura sin datos
 * 
 * Ejecutar con: npx ts-node scripts/create-collections.ts
 */

import { db } from '../src/lib/firebase-admin'

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

