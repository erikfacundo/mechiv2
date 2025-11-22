import { db } from '@/lib/firebase-admin'
import { OrdenTrabajo, EstadoOrden } from '@/types'

const COLLECTION_NAME = 'ordenes'

export async function getOrdenes(): Promise<OrdenTrabajo[]> {
  try {
    const snapshot = await db.collection(COLLECTION_NAME)
      .orderBy('fechaIngreso', 'desc')
      .get()
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      fechaIngreso: doc.data().fechaIngreso?.toDate() || new Date(),
      fechaEntrega: doc.data().fechaEntrega?.toDate() || undefined,
    })) as OrdenTrabajo[]
  } catch (error) {
    console.error('Error obteniendo órdenes:', error)
    return []
  }
}

export async function getOrdenById(id: string): Promise<OrdenTrabajo | null> {
  try {
    const ordenSnap = await db.collection(COLLECTION_NAME).doc(id).get()
    
    if (!ordenSnap.exists) {
      return null
    }
    
    return {
      id: ordenSnap.id,
      ...ordenSnap.data(),
      fechaIngreso: ordenSnap.data()?.fechaIngreso?.toDate() || new Date(),
      fechaEntrega: ordenSnap.data()?.fechaEntrega?.toDate() || undefined,
    } as OrdenTrabajo
  } catch (error) {
    console.error('Error obteniendo orden:', error)
    return null
  }
}

export async function getOrdenesByEstado(estado: EstadoOrden | 'Todos'): Promise<OrdenTrabajo[]> {
  try {
    if (estado === 'Todos') {
      return getOrdenes()
    }
    
    const snapshot = await db.collection(COLLECTION_NAME)
      .where('estado', '==', estado)
      .orderBy('fechaIngreso', 'desc')
      .get()
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      fechaIngreso: doc.data().fechaIngreso?.toDate() || new Date(),
      fechaEntrega: doc.data().fechaEntrega?.toDate() || undefined,
    })) as OrdenTrabajo[]
  } catch (error) {
    console.error('Error obteniendo órdenes por estado:', error)
    return []
  }
}

export async function getOrdenesByCliente(clienteId: string): Promise<OrdenTrabajo[]> {
  try {
    const snapshot = await db.collection(COLLECTION_NAME)
      .where('clienteId', '==', clienteId)
      .orderBy('fechaIngreso', 'desc')
      .get()
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      fechaIngreso: doc.data().fechaIngreso?.toDate() || new Date(),
      fechaEntrega: doc.data().fechaEntrega?.toDate() || undefined,
    })) as OrdenTrabajo[]
  } catch (error) {
    console.error('Error obteniendo órdenes por cliente:', error)
    return []
  }
}

export async function getNextNumeroOrden(): Promise<string> {
  try {
    const año = new Date().getFullYear()
    const snapshot = await db.collection(COLLECTION_NAME)
      .where('numeroOrden', '>=', `OT-${año}-000`)
      .where('numeroOrden', '<', `OT-${año + 1}-000`)
      .orderBy('numeroOrden', 'desc')
      .limit(1)
      .get()

    if (snapshot.empty) {
      return `OT-${año}-001`
    }

    const lastNumero = snapshot.docs[0].data().numeroOrden
    const match = lastNumero.match(/OT-\d{4}-(\d{3})/)
    if (match) {
      const nextNum = parseInt(match[1]) + 1
      return `OT-${año}-${String(nextNum).padStart(3, '0')}`
    }

    return `OT-${año}-001`
  } catch (error) {
    console.error('Error generando número de orden:', error)
    const año = new Date().getFullYear()
    return `OT-${año}-${Math.floor(Math.random() * 999) + 1}`
  }
}

export async function createOrden(orden: Omit<OrdenTrabajo, 'id'>): Promise<string | null> {
  try {
    // Si no viene número de orden, generar uno único
    let numeroOrden = orden.numeroOrden
    if (!numeroOrden) {
      numeroOrden = await getNextNumeroOrden()
    }

    const docRef = await db.collection(COLLECTION_NAME).add({
      ...orden,
      numeroOrden,
      fechaIngreso: new Date(),
    })
    return docRef.id
  } catch (error) {
    console.error('Error creando orden:', error)
    return null
  }
}

export async function updateOrden(id: string, orden: Partial<OrdenTrabajo>): Promise<boolean> {
  try {
    const updateData: any = { ...orden }
    
    if (orden.fechaEntrega) {
      updateData.fechaEntrega = new Date(orden.fechaEntrega)
    }
    
    await db.collection(COLLECTION_NAME).doc(id).update(updateData)
    return true
  } catch (error) {
    console.error('Error actualizando orden:', error)
    return false
  }
}

export async function deleteOrden(id: string): Promise<boolean> {
  try {
    await db.collection(COLLECTION_NAME).doc(id).delete()
    return true
  } catch (error) {
    console.error('Error eliminando orden:', error)
    return false
  }
}

