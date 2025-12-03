/**
 * Script para crear el usuario inicial en Firestore
 * Usuario: admteam
 * Password: gandara3368
 * 
 * Ejecutar con: npm run firestore:create-user
 * o: npx ts-node --project tsconfig.scripts.json scripts/create-initial-user.ts
 */

import { initializeApp, getApps, cert } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import * as bcrypt from 'bcryptjs'
import * as fs from 'fs'
import * as path from 'path'

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
    const jsonPath = path.join(__dirname, '..', 'src', 'lib', 'firebase-admin.json')
    
    if (fs.existsSync(jsonPath)) {
      console.log(`📁 Usando archivo de credenciales: ${jsonPath}`)
      return JSON.parse(fs.readFileSync(jsonPath, 'utf8'))
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

async function createInitialUser() {
  try {
    console.log('🚀 Creando usuario inicial en Firestore...\n')

    const username = 'admteam'
    const password = 'gandara3368' // Sin espacio, como mencionó el usuario

    // Verificar si el usuario ya existe
    const existingUser = await db.collection('usuarios')
      .where('username', '==', username)
      .limit(1)
      .get()

    if (!existingUser.empty) {
      console.log(`⚠️  El usuario '${username}' ya existe`)
      console.log('   Si quieres actualizar la contraseña, elimina el usuario primero en Firestore Console')
      process.exit(0)
    }

    // Generar hash de la contraseña
    const passwordHash = await bcrypt.hash(password, 10)

    // Crear el usuario
    const docRef = await db.collection('usuarios').add({
      username: username,
      passwordHash: passwordHash,
      nombre: 'Admin',
      apellido: 'Team',
      email: 'admin@mechify.com',
      activo: true,
      fechaCreacion: new Date(),
    })

    console.log(`✅ Usuario creado exitosamente!`)
    console.log(`\n📋 Credenciales:`)
    console.log(`   Usuario: ${username}`)
    console.log(`   Contraseña: ${password}`)
    console.log(`   ID del documento: ${docRef.id}`)
    console.log(`\n🎉 Ya puedes iniciar sesión en la aplicación!\n`)

    process.exit(0)
  } catch (error) {
    console.error('❌ Error creando usuario:', error)
    process.exit(1)
  }
}

createInitialUser()

