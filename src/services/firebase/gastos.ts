import { db } from '@/lib/firebase-admin'
import { Gasto } from '@/types'

const COLLECTION_NAME = 'gastos'

export async function getGastos(): Promise<Gasto[]> {
  try {
    const snapshot = await db.collection(COLLECTION_NAME)
      .orderBy('fecha', 'desc')
      .get()
    return snapshot.docs.map((doc: any) => ({
      id: doc.id,
      ...doc.data(),
      fecha: doc.data().fecha?.toDate() || new Date(),
    })) as Gasto[]
  } catch (error) {
    console.error('Error obteniendo gastos:', error)
    return []
  }
}

export async function getGastoById(id: string): Promise<Gasto | null> {
  try {
    const gastoSnap = await db.collection(COLLECTION_NAME).doc(id).get()
    
    if (!gastoSnap.exists) {
      return null
    }
    
    return {
      id: gastoSnap.id,
      ...gastoSnap.data(),
      fecha: gastoSnap.data()?.fecha?.toDate() || new Date(),
    } as Gasto
  } catch (error) {
    console.error('Error obteniendo gasto:', error)
    return null
  }
}

export async function getGastosByProveedor(proveedorId: string): Promise<Gasto[]> {
  try {
    const snapshot = await db.collection(COLLECTION_NAME)
      .where('proveedorId', '==', proveedorId)
      .orderBy('fecha', 'desc')
      .get()
    return snapshot.docs.map((doc: any) => ({
      id: doc.id,
      ...doc.data(),
      fecha: doc.data().fecha?.toDate() || new Date(),
    })) as Gasto[]
  } catch (error) {
    console.error('Error obteniendo gastos por proveedor:', error)
    return []
  }
}

export async function createGasto(gasto: Omit<Gasto, 'id'>): Promise<string | null> {
  try {
    const docRef = await db.collection(COLLECTION_NAME).add({
      ...gasto,
      fecha: new Date(gasto.fecha),
    })
    return docRef.id
  } catch (error) {
    console.error('Error creando gasto:', error)
    return null
  }
}

export async function updateGasto(id: string, gasto: Partial<Gasto>): Promise<boolean> {
  try {
    const updateData: any = { ...gasto }
    if (gasto.fecha) {
      updateData.fecha = new Date(gasto.fecha)
    }
    await db.collection(COLLECTION_NAME).doc(id).update(updateData)
    return true
  } catch (error) {
    console.error('Error actualizando gasto:', error)
    return false
  }
}

export async function deleteGasto(id: string): Promise<boolean> {
  try {
    await db.collection(COLLECTION_NAME).doc(id).delete()
    return true
  } catch (error) {
    console.error('Error eliminando gasto:', error)
    return false
  }
}

