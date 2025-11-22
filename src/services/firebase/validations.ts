import { db } from '@/lib/firebase-admin'

export async function checkDniExists(dni: string, excludeId?: string): Promise<boolean> {
  try {
    let query = db.collection('clientes').where('dni', '==', dni)
    const snapshot = await query.get()
    
    if (excludeId) {
      // Si estamos editando, excluir el documento actual
      return snapshot.docs.some(doc => doc.id !== excludeId)
    }
    
    return !snapshot.empty
  } catch (error) {
    console.error('Error verificando DNI:', error)
    return false
  }
}

export async function checkPatenteExists(patente: string, excludeId?: string): Promise<boolean> {
  try {
    const patenteUpper = patente.toUpperCase()
    const snapshot = await db.collection('vehiculos').where('patente', '==', patenteUpper).get()
    
    if (excludeId) {
      return snapshot.docs.some(doc => doc.id !== excludeId)
    }
    
    return !snapshot.empty
  } catch (error) {
    console.error('Error verificando patente:', error)
    return false
  }
}

export async function checkNumeroOrdenExists(numeroOrden: string, excludeId?: string): Promise<boolean> {
  try {
    let query = db.collection('ordenes').where('numeroOrden', '==', numeroOrden)
    const snapshot = await query.get()
    
    if (excludeId) {
      return snapshot.docs.some(doc => doc.id !== excludeId)
    }
    
    return !snapshot.empty
  } catch (error) {
    console.error('Error verificando número de orden:', error)
    return false
  }
}

