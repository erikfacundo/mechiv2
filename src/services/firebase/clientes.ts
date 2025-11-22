import { db } from '@/lib/firebase-admin'
import { Cliente } from '@/types'

const COLLECTION_NAME = 'clientes'

export async function getClientes(): Promise<Cliente[]> {
  try {
    const snapshot = await db.collection(COLLECTION_NAME).get()
    return snapshot.docs.map((doc: any) => ({
      id: doc.id,
      ...doc.data(),
      fechaRegistro: doc.data().fechaRegistro?.toDate() || new Date(),
    })) as Cliente[]
  } catch (error) {
    console.error('Error obteniendo clientes:', error)
    return []
  }
}

export async function getClienteById(id: string): Promise<Cliente | null> {
  try {
    const clienteSnap = await db.collection(COLLECTION_NAME).doc(id).get()
    
    if (!clienteSnap.exists) {
      return null
    }
    
    return {
      id: clienteSnap.id,
      ...clienteSnap.data(),
      fechaRegistro: clienteSnap.data()?.fechaRegistro?.toDate() || new Date(),
    } as Cliente
  } catch (error) {
    console.error('Error obteniendo cliente:', error)
    return null
  }
}

export async function createCliente(cliente: Omit<Cliente, 'id'>): Promise<string | null> {
  try {
    const docRef = await db.collection(COLLECTION_NAME).add({
      ...cliente,
      fechaRegistro: new Date(),
    })
    return docRef.id
  } catch (error) {
    console.error('Error creando cliente:', error)
    return null
  }
}

export async function updateCliente(id: string, cliente: Partial<Cliente>): Promise<boolean> {
  try {
    await db.collection(COLLECTION_NAME).doc(id).update(cliente)
    return true
  } catch (error) {
    console.error('Error actualizando cliente:', error)
    return false
  }
}

export async function deleteCliente(id: string): Promise<boolean> {
  try {
    await db.collection(COLLECTION_NAME).doc(id).delete()
    return true
  } catch (error) {
    console.error('Error eliminando cliente:', error)
    return false
  }
}

