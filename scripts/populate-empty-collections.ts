/**
 * Script para poblar las colecciones vacías con documentos de ejemplo
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

async function populateEmptyCollections() {
  try {
    console.log('🚀 Poblando colecciones vacías con documentos de ejemplo...\n')

    // Verificar y poblar cobros
    const cobrosSnapshot = await db.collection('cobros').limit(1).get()
    if (cobrosSnapshot.empty) {
      // Necesitamos una orden para asociar
      const ordenesSnapshot = await db.collection('ordenes').limit(1).get()
      if (!ordenesSnapshot.empty) {
        const orden = ordenesSnapshot.docs[0]
        const clientesSnapshot = await db.collection('clientes').limit(1).get()
        if (!clientesSnapshot.empty) {
          const cliente = clientesSnapshot.docs[0]
          await db.collection('cobros').add({
            ordenId: orden.id,
            clienteId: cliente.id,
            monto: 15000,
            fecha: new Date(),
            metodoPago: 'Efectivo',
            estado: 'Completado',
            numeroComprobante: 'COB-001',
            observaciones: 'Cobro de ejemplo',
          })
          console.log('✅ Documento de ejemplo agregado a cobros')
        }
      }
    } else {
      console.log('ℹ️  cobros ya tiene documentos')
    }

    // Verificar y poblar gastos
    const gastosSnapshot = await db.collection('gastos').limit(1).get()
    if (gastosSnapshot.empty) {
      const proveedoresSnapshot = await db.collection('proveedores').limit(1).get()
      const proveedorId = proveedoresSnapshot.empty ? null : proveedoresSnapshot.docs[0].id
      
      await db.collection('gastos').add({
        proveedorId: proveedorId || '',
        categoria: 'Repuestos',
        descripcion: 'Compra de repuestos de ejemplo',
        monto: 5000,
        fecha: new Date(),
        metodoPago: 'Transferencia',
        numeroComprobante: 'GASTO-001',
        observaciones: 'Gasto de ejemplo',
      })
      console.log('✅ Documento de ejemplo agregado a gastos')
    } else {
      console.log('ℹ️  gastos ya tiene documentos')
    }

    // Verificar y poblar turnos
    const turnosSnapshot = await db.collection('turnos').limit(1).get()
    if (turnosSnapshot.empty) {
      const clientesSnapshot = await db.collection('clientes').limit(1).get()
      const vehiculosSnapshot = await db.collection('vehiculos').limit(1).get()
      
      if (!clientesSnapshot.empty && !vehiculosSnapshot.empty) {
        const cliente = clientesSnapshot.docs[0]
        const vehiculo = vehiculosSnapshot.docs[0]
        
        const fecha = new Date()
        fecha.setDate(fecha.getDate() + 1) // Mañana
        
        await db.collection('turnos').add({
          clienteId: cliente.id,
          vehiculoId: vehiculo.id,
          fecha: fecha,
          hora: '10:00',
          descripcion: 'Service programado',
          estado: 'Pendiente',
          observaciones: 'Turno de ejemplo',
          fechaCreacion: new Date(),
        })
        console.log('✅ Documento de ejemplo agregado a turnos')
      }
    } else {
      console.log('ℹ️  turnos ya tiene documentos')
    }

    console.log('\n✅ Proceso completado!')
    console.log('\n📋 Ahora todas las colecciones deberían ser visibles en Firebase Console\n')

    process.exit(0)
  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  }
}

populateEmptyCollections()

