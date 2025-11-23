import { db } from '@/lib/firebase-admin'
import { Mantenimiento } from '@/types'

const COLLECTION_NAME = 'mantenimientos'

export async function getMantenimientos(): Promise<Mantenimiento[]> {
  try {
    const snapshot = await db.collection(COLLECTION_NAME)
      .orderBy('fechaRecordatorio', 'asc')
      .get()
    return snapshot.docs.map((doc: any) => ({
      id: doc.id,
      ...doc.data(),
      fechaRecordatorio: doc.data().fechaRecordatorio?.toDate() || new Date(),
      fechaCompletitud: doc.data().fechaCompletitud?.toDate() || undefined,
      fechaCreacion: doc.data().fechaCreacion?.toDate() || new Date(),
    })) as Mantenimiento[]
  } catch (error) {
    console.error('Error obteniendo mantenimientos:', error)
    return []
  }
}

export async function getMantenimientoById(id: string): Promise<Mantenimiento | null> {
  try {
    const mantenimientoSnap = await db.collection(COLLECTION_NAME).doc(id).get()
    
    if (!mantenimientoSnap.exists) {
      return null
    }
    
    return {
      id: mantenimientoSnap.id,
      ...mantenimientoSnap.data(),
      fechaRecordatorio: mantenimientoSnap.data()?.fechaRecordatorio?.toDate() || new Date(),
      fechaCompletitud: mantenimientoSnap.data()?.fechaCompletitud?.toDate() || undefined,
      fechaCreacion: mantenimientoSnap.data()?.fechaCreacion?.toDate() || new Date(),
    } as Mantenimiento
  } catch (error) {
    console.error('Error obteniendo mantenimiento:', error)
    return null
  }
}

export async function getMantenimientosByVehiculo(vehiculoId: string): Promise<Mantenimiento[]> {
  try {
    const snapshot = await db.collection(COLLECTION_NAME)
      .where('vehiculoId', '==', vehiculoId)
      .orderBy('fechaRecordatorio', 'desc')
      .get()
    return snapshot.docs.map((doc: any) => ({
      id: doc.id,
      ...doc.data(),
      fechaRecordatorio: doc.data().fechaRecordatorio?.toDate() || new Date(),
      fechaCompletitud: doc.data().fechaCompletitud?.toDate() || undefined,
      fechaCreacion: doc.data().fechaCreacion?.toDate() || new Date(),
    })) as Mantenimiento[]
  } catch (error) {
    console.error('Error obteniendo mantenimientos por vehículo:', error)
    return []
  }
}

export async function getMantenimientosPendientes(): Promise<Mantenimiento[]> {
  try {
    const snapshot = await db.collection(COLLECTION_NAME)
      .where('completado', '==', false)
      .orderBy('fechaRecordatorio', 'asc')
      .get()
    return snapshot.docs.map((doc: any) => ({
      id: doc.id,
      ...doc.data(),
      fechaRecordatorio: doc.data().fechaRecordatorio?.toDate() || new Date(),
      fechaCompletitud: doc.data().fechaCompletitud?.toDate() || undefined,
      fechaCreacion: doc.data().fechaCreacion?.toDate() || new Date(),
    })) as Mantenimiento[]
  } catch (error) {
    console.error('Error obteniendo mantenimientos pendientes:', error)
    return []
  }
}

export async function createMantenimiento(mantenimiento: Omit<Mantenimiento, 'id'>): Promise<string | null> {
  try {
    const docRef = await db.collection(COLLECTION_NAME).add({
      ...mantenimiento,
      fechaCreacion: new Date(),
    })
    return docRef.id
  } catch (error) {
    console.error('Error creando mantenimiento:', error)
    return null
  }
}

export async function updateMantenimiento(id: string, mantenimiento: Partial<Mantenimiento>): Promise<boolean> {
  try {
    const updateData: any = { ...mantenimiento }
    
    if (mantenimiento.fechaRecordatorio) {
      updateData.fechaRecordatorio = new Date(mantenimiento.fechaRecordatorio)
    }
    
    if (mantenimiento.fechaCompletitud) {
      updateData.fechaCompletitud = new Date(mantenimiento.fechaCompletitud)
    }
    
    await db.collection(COLLECTION_NAME).doc(id).update(updateData)
    return true
  } catch (error) {
    console.error('Error actualizando mantenimiento:', error)
    return false
  }
}

export async function deleteMantenimiento(id: string): Promise<boolean> {
  try {
    await db.collection(COLLECTION_NAME).doc(id).delete()
    return true
  } catch (error) {
    console.error('Error eliminando mantenimiento:', error)
    return false
  }
}

