import { db } from '@/lib/firebase-admin'
import { Turno } from '@/types'

const COLLECTION_NAME = 'turnos'

export async function getTurnos(): Promise<Turno[]> {
  try {
    const snapshot = await db.collection(COLLECTION_NAME)
      .orderBy('fecha', 'asc')
      .orderBy('hora', 'asc')
      .get()
    return snapshot.docs.map((doc: any) => ({
      id: doc.id,
      ...doc.data(),
      fecha: doc.data().fecha?.toDate() || new Date(),
      fechaCreacion: doc.data().fechaCreacion?.toDate() || new Date(),
    })) as Turno[]
  } catch (error) {
    console.error('Error obteniendo turnos:', error)
    return []
  }
}

export async function getTurnoById(id: string): Promise<Turno | null> {
  try {
    const turnoSnap = await db.collection(COLLECTION_NAME).doc(id).get()
    
    if (!turnoSnap.exists) {
      return null
    }
    
    return {
      id: turnoSnap.id,
      ...turnoSnap.data(),
      fecha: turnoSnap.data()?.fecha?.toDate() || new Date(),
      fechaCreacion: turnoSnap.data()?.fechaCreacion?.toDate() || new Date(),
    } as Turno
  } catch (error) {
    console.error('Error obteniendo turno:', error)
    return null
  }
}

export async function getTurnosByFecha(fecha: Date): Promise<Turno[]> {
  try {
    const inicioDia = new Date(fecha)
    inicioDia.setHours(0, 0, 0, 0)
    const finDia = new Date(fecha)
    finDia.setHours(23, 59, 59, 999)

    const snapshot = await db.collection(COLLECTION_NAME)
      .where('fecha', '>=', inicioDia)
      .where('fecha', '<=', finDia)
      .orderBy('fecha', 'asc')
      .orderBy('hora', 'asc')
      .get()
    return snapshot.docs.map((doc: any) => ({
      id: doc.id,
      ...doc.data(),
      fecha: doc.data().fecha?.toDate() || new Date(),
      fechaCreacion: doc.data().fechaCreacion?.toDate() || new Date(),
    })) as Turno[]
  } catch (error) {
    console.error('Error obteniendo turnos por fecha:', error)
    return []
  }
}

export async function createTurno(turno: Omit<Turno, 'id'>): Promise<string | null> {
  try {
    const docRef = await db.collection(COLLECTION_NAME).add({
      ...turno,
      fecha: new Date(turno.fecha),
      fechaCreacion: new Date(),
    })
    return docRef.id
  } catch (error) {
    console.error('Error creando turno:', error)
    return null
  }
}

export async function updateTurno(id: string, turno: Partial<Turno>): Promise<boolean> {
  try {
    const updateData: any = { ...turno }
    if (turno.fecha) {
      updateData.fecha = new Date(turno.fecha)
    }
    await db.collection(COLLECTION_NAME).doc(id).update(updateData)
    return true
  } catch (error) {
    console.error('Error actualizando turno:', error)
    return false
  }
}

export async function deleteTurno(id: string): Promise<boolean> {
  try {
    await db.collection(COLLECTION_NAME).doc(id).delete()
    return true
  } catch (error) {
    console.error('Error eliminando turno:', error)
    return false
  }
}

