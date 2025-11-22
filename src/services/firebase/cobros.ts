import { db } from '@/lib/firebase-admin'
import { Cobro } from '@/types'

const COLLECTION_NAME = 'cobros'

export async function getCobros(): Promise<Cobro[]> {
  try {
    const snapshot = await db.collection(COLLECTION_NAME)
      .orderBy('fecha', 'desc')
      .get()
    return snapshot.docs.map((doc: any) => ({
      id: doc.id,
      ...doc.data(),
      fecha: doc.data().fecha?.toDate() || new Date(),
    })) as Cobro[]
  } catch (error) {
    console.error('Error obteniendo cobros:', error)
    return []
  }
}

export async function getCobroById(id: string): Promise<Cobro | null> {
  try {
    const cobroSnap = await db.collection(COLLECTION_NAME).doc(id).get()
    
    if (!cobroSnap.exists) {
      return null
    }
    
    return {
      id: cobroSnap.id,
      ...cobroSnap.data(),
      fecha: cobroSnap.data()?.fecha?.toDate() || new Date(),
    } as Cobro
  } catch (error) {
    console.error('Error obteniendo cobro:', error)
    return null
  }
}

export async function getCobrosByOrden(ordenId: string): Promise<Cobro[]> {
  try {
    const snapshot = await db.collection(COLLECTION_NAME)
      .where('ordenId', '==', ordenId)
      .orderBy('fecha', 'desc')
      .get()
    return snapshot.docs.map((doc: any) => ({
      id: doc.id,
      ...doc.data(),
      fecha: doc.data().fecha?.toDate() || new Date(),
    })) as Cobro[]
  } catch (error) {
    console.error('Error obteniendo cobros por orden:', error)
    return []
  }
}

export async function createCobro(cobro: Omit<Cobro, 'id'>): Promise<string | null> {
  try {
    const docRef = await db.collection(COLLECTION_NAME).add({
      ...cobro,
      fecha: new Date(cobro.fecha),
    })
    return docRef.id
  } catch (error) {
    console.error('Error creando cobro:', error)
    return null
  }
}

export async function updateCobro(id: string, cobro: Partial<Cobro>): Promise<boolean> {
  try {
    const updateData: any = { ...cobro }
    if (cobro.fecha) {
      updateData.fecha = new Date(cobro.fecha)
    }
    await db.collection(COLLECTION_NAME).doc(id).update(updateData)
    return true
  } catch (error) {
    console.error('Error actualizando cobro:', error)
    return false
  }
}

export async function deleteCobro(id: string): Promise<boolean> {
  try {
    await db.collection(COLLECTION_NAME).doc(id).delete()
    return true
  } catch (error) {
    console.error('Error eliminando cobro:', error)
    return false
  }
}

