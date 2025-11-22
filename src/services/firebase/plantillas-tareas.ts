import { db } from '@/lib/firebase-admin'
import { PlantillaTarea } from '@/types'

const COLLECTION_NAME = 'plantillas_tareas'

export async function getPlantillasTareas(): Promise<PlantillaTarea[]> {
  try {
    const snapshot = await db.collection(COLLECTION_NAME)
      .where('activa', '==', true)
      .get()
    return snapshot.docs.map((doc: any) => ({
      id: doc.id,
      ...doc.data(),
      fechaCreacion: doc.data().fechaCreacion?.toDate() || new Date(),
    })) as PlantillaTarea[]
  } catch (error) {
    console.error('Error obteniendo plantillas:', error)
    return []
  }
}

export async function getPlantillaTareaById(id: string): Promise<PlantillaTarea | null> {
  try {
    const plantillaSnap = await db.collection(COLLECTION_NAME).doc(id).get()
    
    if (!plantillaSnap.exists) {
      return null
    }
    
    return {
      id: plantillaSnap.id,
      ...plantillaSnap.data(),
      fechaCreacion: plantillaSnap.data()?.fechaCreacion?.toDate() || new Date(),
    } as PlantillaTarea
  } catch (error) {
    console.error('Error obteniendo plantilla:', error)
    return null
  }
}

export async function createPlantillaTarea(plantilla: Omit<PlantillaTarea, 'id'>): Promise<string | null> {
  try {
    const docRef = await db.collection(COLLECTION_NAME).add({
      ...plantilla,
      fechaCreacion: new Date(),
    })
    return docRef.id
  } catch (error) {
    console.error('Error creando plantilla:', error)
    return null
  }
}

export async function updatePlantillaTarea(id: string, plantilla: Partial<PlantillaTarea>): Promise<boolean> {
  try {
    await db.collection(COLLECTION_NAME).doc(id).update(plantilla)
    return true
  } catch (error) {
    console.error('Error actualizando plantilla:', error)
    return false
  }
}

export async function deletePlantillaTarea(id: string): Promise<boolean> {
  try {
    await db.collection(COLLECTION_NAME).doc(id).delete()
    return true
  } catch (error) {
    console.error('Error eliminando plantilla:', error)
    return false
  }
}

