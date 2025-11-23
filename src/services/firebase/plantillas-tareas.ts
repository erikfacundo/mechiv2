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

// Buscar plantilla por nombre (case insensitive)
export async function findPlantillaByNombre(nombre: string): Promise<PlantillaTarea | null> {
  try {
    const snapshot = await db.collection(COLLECTION_NAME)
      .where('nombre', '==', nombre)
      .where('activa', '==', true)
      .limit(1)
      .get()
    
    if (snapshot.empty) {
      return null
    }
    
    const doc = snapshot.docs[0]
    return {
      id: doc.id,
      ...doc.data(),
      fechaCreacion: doc.data().fechaCreacion?.toDate() || new Date(),
    } as PlantillaTarea
  } catch (error) {
    console.error('Error buscando plantilla por nombre:', error)
    return null
  }
}

// Crear plantilla automáticamente si no existe (sistema retroactivo)
export async function findOrCreatePlantilla(
  nombre: string,
  tareaPadre?: string,
  categoria?: string
): Promise<string> {
  try {
    // Buscar si ya existe
    const existente = await findPlantillaByNombre(nombre)
    if (existente) {
      // Incrementar contador de uso
      await incrementPlantillaUsage(existente.id)
      return existente.id
    }
    
    // Crear nueva plantilla
    const nuevaPlantilla: Omit<PlantillaTarea, 'id'> = {
      nombre,
      descripcion: '',
      categoria: categoria || '',
      tiempoEstimado: 0,
      costoEstimado: 0,
      pasos: [],
      activa: true,
      fechaCreacion: new Date(),
      tareaPadre: tareaPadre || undefined,
      subtareas: [],
      esTareaPadre: false,
      usoCount: 1,
    }
    
    const id = await createPlantillaTarea(nuevaPlantilla)
    
    // Si tiene tarea padre, actualizar la tarea padre para incluir esta subtarea
    if (tareaPadre && id) {
      const padre = await getPlantillaTareaById(tareaPadre)
      if (padre) {
        const subtareas = padre.subtareas || []
        if (!subtareas.includes(id)) {
          await updatePlantillaTarea(tareaPadre, {
            subtareas: [...subtareas, id],
            esTareaPadre: true,
          })
        }
      }
    }
    
    return id || ''
  } catch (error) {
    console.error('Error en findOrCreatePlantilla:', error)
    return ''
  }
}

// Obtener plantillas padre (sin tareaPadre)
export async function getPlantillasPadre(): Promise<PlantillaTarea[]> {
  try {
    const snapshot = await db.collection(COLLECTION_NAME)
      .where('activa', '==', true)
      .where('esTareaPadre', '==', true)
      .get()
    return snapshot.docs.map((doc: any) => ({
      id: doc.id,
      ...doc.data(),
      fechaCreacion: doc.data().fechaCreacion?.toDate() || new Date(),
    })) as PlantillaTarea[]
  } catch (error) {
    console.error('Error obteniendo plantillas padre:', error)
    return []
  }
}

// Obtener subtareas de una plantilla padre
export async function getSubtareasByPadre(tareaPadreId: string): Promise<PlantillaTarea[]> {
  try {
    const snapshot = await db.collection(COLLECTION_NAME)
      .where('activa', '==', true)
      .where('tareaPadre', '==', tareaPadreId)
      .get()
    return snapshot.docs.map((doc: any) => ({
      id: doc.id,
      ...doc.data(),
      fechaCreacion: doc.data().fechaCreacion?.toDate() || new Date(),
    })) as PlantillaTarea[]
  } catch (error) {
    console.error('Error obteniendo subtareas:', error)
    return []
  }
}

// Incrementar contador de uso
export async function incrementPlantillaUsage(id: string): Promise<boolean> {
  try {
    const plantilla = await getPlantillaTareaById(id)
    if (!plantilla) return false
    
    const nuevoCount = (plantilla.usoCount || 0) + 1
    await updatePlantillaTarea(id, { usoCount: nuevoCount })
    return true
  } catch (error) {
    console.error('Error incrementando uso de plantilla:', error)
    return false
  }
}

// Obtener plantillas más usadas
export async function getMostUsedPlantillas(limit: number = 10): Promise<PlantillaTarea[]> {
  try {
    const snapshot = await db.collection(COLLECTION_NAME)
      .where('activa', '==', true)
      .orderBy('usoCount', 'desc')
      .limit(limit)
      .get()
    return snapshot.docs.map((doc: any) => ({
      id: doc.id,
      ...doc.data(),
      fechaCreacion: doc.data().fechaCreacion?.toDate() || new Date(),
    })) as PlantillaTarea[]
  } catch (error) {
    console.error('Error obteniendo plantillas más usadas:', error)
    return []
  }
}

