import { db } from '@/lib/firebase-admin'
import { Vehiculo } from '@/types'

const COLLECTION_NAME = 'vehiculos'

export async function getVehiculos(): Promise<Vehiculo[]> {
  try {
    const snapshot = await db.collection(COLLECTION_NAME).get()
    const vehiculos = snapshot.docs.map(doc => {
      const data = doc.data()
      // Procesar fotos si existen
      const fotos = data.fotos?.map((foto: any) => {
        // Convertir fechaHora si es Timestamp de Firestore
        let fechaHora = new Date()
        if (foto.fechaHora) {
          if (foto.fechaHora.toDate) {
            fechaHora = foto.fechaHora.toDate()
          } else if (foto.fechaHora instanceof Date) {
            fechaHora = foto.fechaHora
          } else if (typeof foto.fechaHora === 'string' || typeof foto.fechaHora === 'number') {
            fechaHora = new Date(foto.fechaHora)
          }
        }
        
        // Si dataUrl es una URL de R2 (no base64), moverla a url
        let url = foto.url
        let dataUrl = foto.dataUrl
        
        if (dataUrl && !dataUrl.startsWith('data:') && (dataUrl.startsWith('http://') || dataUrl.startsWith('https://'))) {
          // Es una URL, no base64 - moverla a url
          url = dataUrl
          dataUrl = undefined
        }
        
        return {
          id: foto.id || `foto-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          url: url || undefined,
          dataUrl: dataUrl || undefined,
          fechaHora,
          descripcion: foto.descripcion || undefined,
        }
      }) || []
      
      return {
        id: doc.id,
        clienteId: data.clienteId || '',
        marca: data.marca || '',
        modelo: data.modelo || '',
        año: data.año || new Date().getFullYear(),
        patente: data.patente || '',
        kilometraje: data.kilometraje || 0,
        color: data.color || '',
        tipoCombustible: data.tipoCombustible || 'nafta',
        fotos: fotos.length > 0 ? fotos : undefined,
      }
    }) as Vehiculo[]
    
    console.log(`getVehiculos: Se obtuvieron ${vehiculos.length} vehículos`)
    
    // Log detallado para debugging
    if (vehiculos.length > 0) {
      console.log('Vehículos obtenidos:', vehiculos.map(v => ({
        id: v.id,
        patente: v.patente,
        marca: v.marca,
        modelo: v.modelo,
        clienteId: v.clienteId,
        fotosCount: v.fotos?.length || 0
      })))
    } else {
      console.warn('getVehiculos: No se obtuvieron vehículos. Verificar Firestore.')
    }
    
    return vehiculos
  } catch (error) {
    console.error('Error obteniendo vehículos:', error)
    return []
  }
}

export async function getVehiculoById(id: string): Promise<Vehiculo | null> {
  try {
    const vehiculoSnap = await db.collection(COLLECTION_NAME).doc(id).get()
    
    if (!vehiculoSnap.exists) {
      console.log(`getVehiculoById: Vehículo ${id} no encontrado`)
      return null
    }
    
    const data = vehiculoSnap.data()
    if (!data) {
      console.log(`getVehiculoById: Vehículo ${id} no tiene datos`)
      return null
    }
    
    // Procesar fotos si existen
    const fotos = data.fotos?.map((foto: any) => {
      // Convertir fechaHora si es Timestamp de Firestore
      let fechaHora = new Date()
      if (foto.fechaHora) {
        if (foto.fechaHora.toDate) {
          fechaHora = foto.fechaHora.toDate()
        } else if (foto.fechaHora instanceof Date) {
          fechaHora = foto.fechaHora
        } else if (typeof foto.fechaHora === 'string' || typeof foto.fechaHora === 'number') {
          fechaHora = new Date(foto.fechaHora)
        }
      }
      
      // Si dataUrl es una URL de R2 (no base64), moverla a url
      let url = foto.url
      let dataUrl = foto.dataUrl
      
      if (dataUrl && !dataUrl.startsWith('data:') && (dataUrl.startsWith('http://') || dataUrl.startsWith('https://'))) {
        // Es una URL, no base64 - moverla a url
        url = dataUrl
        dataUrl = undefined
      }
      
      return {
        id: foto.id || `foto-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        url: url || undefined,
        dataUrl: dataUrl || undefined,
        fechaHora,
        descripcion: foto.descripcion || undefined,
      }
    }) || []
    
    const vehiculo: Vehiculo = {
      id: vehiculoSnap.id,
      clienteId: data.clienteId || '',
      marca: data.marca || '',
      modelo: data.modelo || '',
      año: data.año || new Date().getFullYear(),
      patente: data.patente || '',
      kilometraje: data.kilometraje || 0,
      color: data.color || '',
      tipoCombustible: data.tipoCombustible || 'nafta',
      fotos: fotos.length > 0 ? fotos : undefined,
    }
    
    console.log(`getVehiculoById: Vehículo ${id} obtenido:`, {
      patente: vehiculo.patente,
      marca: vehiculo.marca,
      modelo: vehiculo.modelo,
      fotosCount: vehiculo.fotos?.length || 0
    })
    
    return vehiculo
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

