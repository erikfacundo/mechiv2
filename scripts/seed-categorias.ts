/**
 * Script para poblar la base de datos con las categorías completas
 * y sus subcategorías según la lista proporcionada
 * 
 * Ejecutar con: npm run firestore:seed-categorias
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

// Categorías completas con sus subcategorías
const categoriasCompletas = [
  {
    nombre: 'Diagnóstico Electrónico y Reparación de Fallas',
    descripcion: 'Servicios de diagnóstico y reparación de sistemas electrónicos del vehículo',
    color: '#3b82f6',
    activa: true,
    subcategorias: [
      'Escaneo y Diagnóstico OBD-II',
      'Reparación de Unidades de Control Electrónico (ECU)',
      'Diagnóstico de Sensores y Actuadores',
      'Programación y Codificación de Módulos (llaves, inyectores)',
      'Solución de Fallas Eléctricas Complejas y Cableado',
    ],
  },
  {
    nombre: 'Sistema de Frenos y Seguridad Activa',
    descripcion: 'Mantenimiento y reparación del sistema de frenos y sistemas de seguridad',
    color: '#ef4444',
    activa: true,
    subcategorias: [
      'Mantenimiento y Reemplazo de Pastillas y Discos',
      'Reparación y Purga del Sistema Hidráulico (Líquido de Frenos)',
      'Diagnóstico y Servicio del Sistema ABS, EBD y ESP',
      'Ajuste y Reparación de Freno de Mano (Estacionamiento)',
      'Reemplazo de Componentes de Suspensión (Amortiguadores, Rótulas)',
    ],
  },
  {
    nombre: 'Mantenimiento Preventivo y Correctivo',
    descripcion: 'Servicios de mantenimiento preventivo y correctivo del vehículo',
    color: '#10b981',
    activa: true,
    subcategorias: [
      'Servicio de Cambio de Aceite y Filtros',
      'Revisión y Sustitución de Correas (Distribución, Accesorios)',
      'Afinación Mayor (Bujías, Inyectores, Filtros de aire/gasolina)',
      'Revisión de Niveles y Fluidos (Refrigerante, Transmisión)',
      'Inspección Pre-Viaje o Pre-Compra Vehicular',
    ],
  },
  {
    nombre: 'Servicio de Cerrajería Automotriz',
    descripcion: 'Servicios de cerrajería, llaves y sistemas de seguridad para vehículos',
    color: '#f59e0b',
    activa: true,
    subcategorias: [
      'Apertura de Vehículos (en caso de llaves dentro)',
      'Duplicado y Programación de Llaves con Chip (Transponder)',
      'Reparación y Reemplazo de Cerraduras y Cilindros',
      'Reparación de Sistemas de Arranque (Ignición)',
      'Instalación de Sistemas de Seguridad Adicionales (Alarmas, GPS)',
    ],
  },
  {
    nombre: 'Instalación y Configuración de Audio (Audiocar)',
    descripcion: 'Instalación y configuración de sistemas de audio para vehículos',
    color: '#8b5cf6',
    activa: true,
    subcategorias: [
      'Instalación de Unidades Principales (Radios, Navegadores, Pantallas)',
      'Montaje y Cableado de Amplificadores y Subwoofers',
      'Instalación de Altavoces y Tweeters de Componente',
      'Configuración y Ajuste de Audio (Tuning y DSP)',
      'Fabricación de Cajones Acústicos y Paneles a Medida',
    ],
  },
  {
    nombre: 'Insonorización y Acústica Vehicular',
    descripcion: 'Servicios de insonorización y mejora acústica del vehículo',
    color: '#06b6d4',
    activa: true,
    subcategorias: [
      'Aplicación de Material Amortiguador (Dampening) en Puertas',
      'Aislamiento Acústico de Piso y Techo',
      'Tratamiento Antivibratorio de Paneles y Plásticos',
      'Reducción de Ruido de Motor y Escape (cortafuegos)',
      'Mejora de la Calidad de Audio por Aislamiento (anti-resonancia)',
    ],
  },
  {
    nombre: 'Iluminación y Accesorios Electrónicos',
    descripcion: 'Instalación y reparación de sistemas de iluminación y accesorios electrónicos',
    color: '#ec4899',
    activa: true,
    subcategorias: [
      'Instalación de Luces LED y Xenón (Faros Principales)',
      'Montaje de Luces Auxiliares y Barras LED (Decorativas o Off-Road)',
      'Instalación de Cámaras de Reversa y Sensores de Estacionamiento',
      'Sistemas de Video y Entretenimiento (Monitores, Cabeceras)',
      'Accesorios de Carga USB y Tomas de Corriente Adicionales',
    ],
  },
  {
    nombre: 'Reparación de Motor y Transmisión',
    descripcion: 'Servicios de reparación y mantenimiento de motor y transmisión',
    color: '#f97316',
    activa: true,
    subcategorias: [
      'Servicio Mayor de Motor (Ajustes, Cambio de Juntas, Cabeza)',
      'Reparación y Mantenimiento de Transmisión Automática',
      'Reparación y Mantenimiento de Transmisión Manual',
      'Reemplazo de Embragues (Clutch) y Volantes',
      'Detección y Reparación de Fugas de Aceite y Refrigerante',
    ],
  },
  {
    nombre: 'Climatización y Refrigeración',
    descripcion: 'Servicios de aire acondicionado, calefacción y sistemas de refrigeración',
    color: '#14b8a6',
    activa: true,
    subcategorias: [
      'Carga de Gas Refrigerante y Servicio de Mantenimiento de A/C',
      'Diagnóstico y Reparación de Fugas del Sistema de A/C',
      'Reemplazo de Compresores y Condensadores',
      'Limpieza y Sustitución de Filtro de Cabina (Anti-polen)',
      'Reparación de Calefacción y Sistemas de Ventilación',
    ],
  },
  {
    nombre: 'Servicios de Detallado y Estética',
    descripcion: 'Servicios de detallado, estética y protección del vehículo',
    color: '#84cc16',
    activa: true,
    subcategorias: [
      'Pulido, Corrección de Pintura y Encerado de Carrocería',
      'Restauración de Faros Quemados u Opacos',
      'Detallado de Interiores (Limpieza Profunda de Tapicería y Alfombras)',
      'Instalación de Películas de Seguridad y Polarizado (Tintado)',
      'Aplicación de Recubrimientos Cerámicos de Protección de Pintura',
    ],
  },
]

async function seedCategorias() {
  try {
    console.log('🚀 Iniciando población de categorías...\n')

    // Verificar si ya existen categorías
    const existingSnapshot = await db.collection('categorias').get()
    const existingCount = existingSnapshot.size

    if (existingCount > 0) {
      console.log(`⚠️  Se encontraron ${existingCount} categorías existentes`)
      console.log('   Se eliminarán las categorías existentes y se crearán las nuevas...\n')
      
      // Eliminar categorías existentes
      const batch = db.batch()
      existingSnapshot.docs.forEach((doc) => {
        batch.delete(doc.ref)
      })
      await batch.commit()
      console.log(`✅ ${existingCount} categorías eliminadas\n`)
    }

    // Crear nuevas categorías
    console.log('📁 Creando categorías con sus subcategorías...\n')
    let created = 0

    for (const categoria of categoriasCompletas) {
      await db.collection('categorias').add({
        ...categoria,
        fechaCreacion: new Date(),
      })
      created++
      console.log(`✅ ${categoria.nombre}`)
      console.log(`   └─ ${categoria.subcategorias.length} subtareas creadas`)
    }

    console.log(`\n✅ Migración completada exitosamente!`)
    console.log(`\n📋 Resumen:`)
    console.log(`   - Categorías creadas: ${created}`)
    console.log(`   - Total de subtareas: ${categoriasCompletas.reduce((sum, cat) => sum + cat.subcategorias.length, 0)}`)
    console.log(`\n💡 Las categorías están listas para usar en el sistema.\n`)

    process.exit(0)
  } catch (error) {
    console.error('❌ Error durante la migración:', error)
    process.exit(1)
  }
}

seedCategorias()

