import { db } from '@/lib/firebase-admin'
import { Vehiculo } from '@/types'

const COLLECTION_NAME = 'vehiculos'

export async function getVehiculos(): Promise<Vehiculo[]> {
  try {
    const snapshot = await db.collection(COLLECTION_NAME).get()
    return snapshot.docs.map(doc => {
      const data = doc.data()
      // Procesar fotos si existen
      const fotos = data.fotos?.map((foto: any) => ({
        ...foto,
        fechaHora: foto.fechaHora?.toDate() || new Date(foto.fechaHora) || new Date(),
      })) || []
      return {
        id: doc.id,
        ...data,
        fotos,
      }
    }) as Vehiculo[]
  } catch (error) {
    console.error('Error obteniendo vehículos:', error)
    return []
  }
}

export async function getVehiculoById(id: string): Promise<Vehiculo | null> {
  try {
    const vehiculoSnap = await db.collection(COLLECTION_NAME).doc(id).get()
    
    if (!vehiculoSnap.exists) {
      return null
    }
    
    const data = vehiculoSnap.data()
    // Procesar fotos si existen
    const fotos = data?.fotos?.map((foto: any) => ({
      ...foto,
      fechaHora: foto.fechaHora?.toDate() || new Date(foto.fechaHora) || new Date(),
    })) || []
    
    return {
      id: vehiculoSnap.id,
      ...data,
      fotos,
    } as Vehiculo
  } catch (error) {
    console.error('Error obteniendo vehículo:', error)
    return null
  }
}

export async function getVehiculosByCliente(clienteId: string): Promise<Vehiculo[]> {
  try {
    const snapshot = await db.collection(COLLECTION_NAME)
      .where('clienteId', '==', clienteId)
      .get()
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as Vehiculo[]
  } catch (error) {
    console.error('Error obteniendo vehículos por cliente:', error)
    return []
  }
}

export async function createVehiculo(vehiculo: Omit<Vehiculo, 'id'>): Promise<string | null> {
  try {
    const docRef = await db.collection(COLLECTION_NAME).add(vehiculo)
    return docRef.id
  } catch (error) {
    console.error('Error creando vehículo:', error)
    return null
  }
}

export async function updateVehiculo(id: string, vehiculo: Partial<Vehiculo>): Promise<boolean> {
  try {
    await db.collection(COLLECTION_NAME).doc(id).update(vehiculo)
    return true
  } catch (error) {
    console.error('Error actualizando vehículo:', error)
    return false
  }
}

export async function deleteVehiculo(id: string): Promise<boolean> {
  try {
    await db.collection(COLLECTION_NAME).doc(id).delete()
    return true
  } catch (error) {
    console.error('Error eliminando vehículo:', error)
    return false
  }
}

