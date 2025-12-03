import { db } from '@/lib/firebase-admin'
import { Usuario } from '@/types'
import bcrypt from 'bcryptjs'

const COLLECTION_NAME = 'usuarios'

function convertToDate(date: any): Date {
  if (!date) return new Date()
  if (date instanceof Date) return date
  if (date.toDate && typeof date.toDate === 'function') return date.toDate()
  if (typeof date === 'string' || typeof date === 'number') return new Date(date)
  return new Date()
}

export async function getUsuarios(): Promise<Omit<Usuario, 'passwordHash'>[]> {
  try {
    const snapshot = await db.collection(COLLECTION_NAME).get()
    return snapshot.docs.map((doc: any) => {
      const data = doc.data()
      return {
        id: doc.id,
        username: data.username,
        nombre: data.nombre,
        apellido: data.apellido,
        email: data.email,
        activo: data.activo ?? true,
        fechaCreacion: convertToDate(data.fechaCreacion),
        fechaUltimoAcceso: data.fechaUltimoAcceso ? convertToDate(data.fechaUltimoAcceso) : undefined,
      }
    })
  } catch (error) {
    console.error('Error obteniendo usuarios:', error)
    return []
  }
}

export async function getUsuarioById(id: string): Promise<Omit<Usuario, 'passwordHash'> | null> {
  try {
    const usuarioSnap = await db.collection(COLLECTION_NAME).doc(id).get()
    
    if (!usuarioSnap.exists) {
      return null
    }
    
    const data = usuarioSnap.data()
    return {
      id: usuarioSnap.id,
      username: data?.username,
      nombre: data?.nombre,
      apellido: data?.apellido,
      email: data?.email,
      activo: data?.activo ?? true,
      fechaCreacion: convertToDate(data?.fechaCreacion),
      fechaUltimoAcceso: data?.fechaUltimoAcceso ? convertToDate(data.fechaUltimoAcceso) : undefined,
    }
  } catch (error) {
    console.error('Error obteniendo usuario:', error)
    return null
  }
}

export async function getUsuarioByUsername(username: string): Promise<Usuario | null> {
  try {
    const snapshot = await db.collection(COLLECTION_NAME)
      .where('username', '==', username)
      .limit(1)
      .get()
    
    if (snapshot.empty) {
      return null
    }
    
    const doc = snapshot.docs[0]
    const data = doc.data()
    return {
      id: doc.id,
      username: data.username,
      passwordHash: data.passwordHash,
      nombre: data.nombre,
      apellido: data.apellido,
      email: data.email,
      activo: data.activo ?? true,
      fechaCreacion: convertToDate(data.fechaCreacion),
      fechaUltimoAcceso: data.fechaUltimoAcceso ? convertToDate(data.fechaUltimoAcceso) : undefined,
    }
  } catch (error) {
    console.error('Error obteniendo usuario por username:', error)
    return null
  }
}

export async function createUsuario(usuario: Omit<Usuario, 'id' | 'passwordHash'> & { password: string }): Promise<string | null> {
  try {
    const existingUser = await getUsuarioByUsername(usuario.username)
    if (existingUser) {
      throw new Error('El nombre de usuario ya existe')
    }

    const passwordHash = await bcrypt.hash(usuario.password, 10)
    
    const docRef = await db.collection(COLLECTION_NAME).add({
      username: usuario.username,
      passwordHash,
      nombre: usuario.nombre,
      apellido: usuario.apellido,
      email: usuario.email,
      activo: usuario.activo ?? true,
      fechaCreacion: new Date(),
    })
    return docRef.id
  } catch (error) {
    console.error('Error creando usuario:', error)
    throw error
  }
}

export async function updateUsuario(id: string, usuario: Partial<Omit<Usuario, 'id' | 'passwordHash'>> & { password?: string }): Promise<boolean> {
  try {
    const updateData: any = { ...usuario }
    
    if (usuario.password) {
      updateData.passwordHash = await bcrypt.hash(usuario.password, 10)
      delete updateData.password
    }
    
    if (usuario.fechaUltimoAcceso) {
      updateData.fechaUltimoAcceso = convertToDate(usuario.fechaUltimoAcceso)
    }

    const cleanData: any = {}
    for (const key in updateData) {
      if (updateData[key] !== undefined) {
        cleanData[key] = updateData[key]
      }
    }

    await db.collection(COLLECTION_NAME).doc(id).update(cleanData)
    return true
  } catch (error) {
    console.error('Error actualizando usuario:', error)
    return false
  }
}

export async function deleteUsuario(id: string): Promise<boolean> {
  try {
    await db.collection(COLLECTION_NAME).doc(id).delete()
    return true
  } catch (error) {
    console.error('Error eliminando usuario:', error)
    return false
  }
}

export async function verifyPassword(username: string, password: string): Promise<Usuario | null> {
  try {
    const usuario = await getUsuarioByUsername(username)
    if (!usuario || !usuario.activo) {
      return null
    }

    const isValid = await bcrypt.compare(password, usuario.passwordHash)
    if (!isValid) {
      return null
    }

    await updateUsuario(usuario.id, { fechaUltimoAcceso: new Date() })
    
    return usuario
  } catch (error) {
    console.error('Error verificando contraseña:', error)
    return null
  }
}


