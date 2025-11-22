import { db } from '@/lib/firebase-admin'
import { Proveedor } from '@/types'

const COLLECTION_NAME = 'proveedores'

export async function getProveedores(): Promise<Proveedor[]> {
  try {
    const snapshot = await db.collection(COLLECTION_NAME)
      .where('activo', '==', true)
      .get()
    return snapshot.docs.map((doc: any) => ({
      id: doc.id,
      ...doc.data(),
      fechaRegistro: doc.data().fechaRegistro?.toDate() || new Date(),
    })) as Proveedor[]
  } catch (error) {
    console.error('Error obteniendo proveedores:', error)
    return []
  }
}

export async function getProveedorById(id: string): Promise<Proveedor | null> {
  try {
    const proveedorSnap = await db.collection(COLLECTION_NAME).doc(id).get()
    
    if (!proveedorSnap.exists) {
      return null
    }
    
    return {
      id: proveedorSnap.id,
      ...proveedorSnap.data(),
      fechaRegistro: proveedorSnap.data()?.fechaRegistro?.toDate() || new Date(),
    } as Proveedor
  } catch (error) {
    console.error('Error obteniendo proveedor:', error)
    return null
  }
}

export async function createProveedor(proveedor: Omit<Proveedor, 'id'>): Promise<string | null> {
  try {
    const docRef = await db.collection(COLLECTION_NAME).add({
      ...proveedor,
      fechaRegistro: new Date(),
    })
    return docRef.id
  } catch (error) {
    console.error('Error creando proveedor:', error)
    return null
  }
}

export async function updateProveedor(id: string, proveedor: Partial<Proveedor>): Promise<boolean> {
  try {
    await db.collection(COLLECTION_NAME).doc(id).update(proveedor)
    return true
  } catch (error) {
    console.error('Error actualizando proveedor:', error)
    return false
  }
}

export async function deleteProveedor(id: string): Promise<boolean> {
  try {
    await db.collection(COLLECTION_NAME).doc(id).delete()
    return true
  } catch (error) {
    console.error('Error eliminando proveedor:', error)
    return false
  }
}

