/**
 * Script para migrar datos mockeados a Firestore
 * Ejecutar con: npx ts-node scripts/migrate-data.ts
 */

import { db } from '../src/lib/firebase-admin'
import { clientesMock, vehiculosMock, ordenesMock } from '../src/services/data-mock'

async function migrateData() {
  try {
    console.log('Iniciando migración de datos...')

    // Migrar clientes
    console.log('Migrando clientes...')
    for (const cliente of clientesMock) {
      await db.collection('clientes').add({
        ...cliente,
        fechaRegistro: cliente.fechaRegistro,
      })
    }
    console.log(`✓ ${clientesMock.length} clientes migrados`)

    // Migrar vehículos
    console.log('Migrando vehículos...')
    for (const vehiculo of vehiculosMock) {
      await db.collection('vehiculos').add(vehiculo)
    }
    console.log(`✓ ${vehiculosMock.length} vehículos migrados`)

    // Migrar órdenes
    console.log('Migrando órdenes...')
    for (const orden of ordenesMock) {
      await db.collection('ordenes').add({
        ...orden,
        fechaIngreso: orden.fechaIngreso,
        fechaEntrega: orden.fechaEntrega || null,
      })
    }
    console.log(`✓ ${ordenesMock.length} órdenes migradas`)

    console.log('✓ Migración completada exitosamente!')
    process.exit(0)
  } catch (error) {
    console.error('Error durante la migración:', error)
    process.exit(1)
  }
}

migrateData()

