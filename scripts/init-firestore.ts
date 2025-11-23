/**
 * Script para inicializar las colecciones de Firestore
 * Crea las colecciones necesarias y opcionalmente migra datos de ejemplo
 * 
 * Ejecutar con: npx ts-node scripts/init-firestore.ts
 */

import { initializeApp, getApps, cert } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import { clientesMock, vehiculosMock, ordenesMock } from '../src/services/data-mock'

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

async function initFirestore() {
  try {
    console.log('🚀 Iniciando inicialización de Firestore...\n')

    // Verificar si las colecciones ya tienen datos
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

    const estados: Record<string, boolean> = {}
    
    for (const collection of collections) {
      try {
        const snapshot = await db.collection(collection).limit(1).get()
        estados[collection] = !snapshot.empty
      } catch (error) {
        estados[collection] = false
      }
    }

    console.log('📊 Estado actual de las colecciones:')
    collections.forEach(col => {
      console.log(`  - ${col}: ${estados[col] ? '✅ Tiene datos' : '❌ Vacía'}`)
    })
    console.log()

    const todasTienenDatos = collections.every(col => estados[col])
    
    if (todasTienenDatos) {
      console.log('⚠️  Todas las colecciones ya tienen datos.')
      console.log('   Si quieres migrar datos de ejemplo, elimina primero los datos existentes.\n')
      return
    }

    // Migrar categorías si está vacía
    if (!estados['categorias']) {
      console.log('📁 Creando categorías...')
      const categorias = [
        { nombre: 'Service', descripcion: 'Servicios de mantenimiento', color: '#3b82f6', activa: true },
        { nombre: 'Reparación', descripcion: 'Reparaciones generales', color: '#ef4444', activa: true },
        { nombre: 'Limpieza', descripcion: 'Limpieza y detallado', color: '#10b981', activa: true },
        { nombre: 'Diagnóstico', descripcion: 'Diagnósticos técnicos', color: '#f59e0b', activa: true },
      ]
      for (const cat of categorias) {
        await db.collection('categorias').add({
          ...cat,
          fechaCreacion: new Date(),
        })
      }
      console.log(`✅ ${categorias.length} categorías creadas\n`)
    }

    // Migrar clientes si está vacía
    if (!estados['clientes']) {
      console.log('📝 Migrando clientes...')
      for (const cliente of clientesMock) {
        await db.collection('clientes').add({
          nombre: cliente.nombre,
          apellido: cliente.apellido,
          dni: cliente.dni,
          telefono: cliente.telefono,
          email: cliente.email,
          direccion: cliente.direccion || null,
          fechaRegistro: cliente.fechaRegistro,
        })
      }
      console.log(`✅ ${clientesMock.length} clientes migrados\n`)
    }

    // Migrar vehículos si está vacía
    if (!estados['vehiculos']) {
      console.log('🚗 Migrando vehículos...')
      for (const vehiculo of vehiculosMock) {
        await db.collection('vehiculos').add({
          clienteId: vehiculo.clienteId,
          marca: vehiculo.marca,
          modelo: vehiculo.modelo,
          año: vehiculo.año,
          patente: vehiculo.patente.toUpperCase(),
          kilometraje: vehiculo.kilometraje,
          color: vehiculo.color || null,
          tipoCombustible: vehiculo.tipoCombustible || null,
        })
      }
      console.log(`✅ ${vehiculosMock.length} vehículos migrados\n`)
    }

    // Migrar órdenes si está vacía
    if (!estados['ordenes']) {
      console.log('📋 Migrando órdenes...')
      for (const orden of ordenesMock) {
        await db.collection('ordenes').add({
          clienteId: orden.clienteId,
          vehiculoId: orden.vehiculoId,
          numeroOrden: orden.numeroOrden,
          fechaIngreso: orden.fechaIngreso,
          fechaEntrega: orden.fechaEntrega || null,
          estado: orden.estado,
          descripcion: orden.descripcion,
          servicios: orden.servicios,
          costoTotal: orden.costoTotal,
          observaciones: orden.observaciones || null,
        })
      }
      console.log(`✅ ${ordenesMock.length} órdenes migradas\n`)
    }

    // Crear proveedores de ejemplo si está vacía
    if (!estados['proveedores']) {
      console.log('🏪 Creando proveedores...')
      const proveedores = [
        { nombre: 'Repuestos ABC', telefono: '+54 11 1111-1111', tipo: 'Repuestos', activo: true },
        { nombre: 'Servicios XYZ', telefono: '+54 11 2222-2222', tipo: 'Servicios', activo: true },
        { nombre: 'Insumos 123', telefono: '+54 11 3333-3333', tipo: 'Insumos', activo: true },
      ]
      for (const prov of proveedores) {
        await db.collection('proveedores').add({
          ...prov,
          fechaRegistro: new Date(),
        })
      }
      console.log(`✅ ${proveedores.length} proveedores creados\n`)
    }

    // Crear plantillas de ejemplo si está vacía
    if (!estados['plantillas_tareas']) {
      console.log('📄 Creando plantillas de tareas...')
      const plantillas = [
        {
          nombre: 'Service Básico',
          descripcion: 'Service básico de mantenimiento',
          tiempoEstimado: 120,
          costoEstimado: 15000,
          pasos: ['Cambio de aceite', 'Filtros', 'Revisión general'],
          activa: true,
        },
        {
          nombre: 'Service Completo',
          descripcion: 'Service completo con todos los servicios',
          tiempoEstimado: 240,
          costoEstimado: 30000,
          pasos: ['Cambio de aceite', 'Filtros', 'Bujías', 'Frenos', 'Revisión completa'],
          activa: true,
        },
      ]
      for (const plant of plantillas) {
        await db.collection('plantillas_tareas').add({
          ...plant,
          fechaCreacion: new Date(),
        })
      }
      console.log(`✅ ${plantillas.length} plantillas creadas\n`)
    }

    console.log('✅ Inicialización completada exitosamente!')
    console.log('\n📋 Próximos pasos:')
    console.log('   1. Verifica las colecciones en Firebase Console')
    console.log('   2. Crea los índices necesarios (ver README_FIREBASE.md)')
    console.log('   3. Ejecuta el proyecto con: npm run dev\n')

    process.exit(0)
  } catch (error) {
    console.error('❌ Error durante la inicialización:', error)
    process.exit(1)
  }
}

initFirestore()

