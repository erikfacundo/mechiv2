import { db } from '@/lib/firebase-admin'
import { Categoria } from '@/types'

const COLLECTION_NAME = 'categorias'

export async function getCategorias(): Promise<Categoria[]> {
  try {
    const snapshot = await db.collection(COLLECTION_NAME)
      .where('activa', '==', true)
      .get()
    return snapshot.docs.map((doc: any) => {
      const data = doc.data()
      return {
        id: doc.id,
        ...data,
        fechaCreacion: data.fechaCreacion?.toDate() || new Date(),
        subcategorias: data.subcategorias || [], // Asegurar que siempre sea un array
      }
    }) as Categoria[]
  } catch (error) {
    console.error('Error obteniendo categorías:', error)
    return []
  }
}

export async function getCategoriaById(id: string): Promise<Categoria | null> {
  try {
    const categoriaSnap = await db.collection(COLLECTION_NAME).doc(id).get()
    
    if (!categoriaSnap.exists) {
      return null
    }
    
    const data = categoriaSnap.data()
    return {
      id: categoriaSnap.id,
      ...data,
      fechaCreacion: data?.fechaCreacion?.toDate() || new Date(),
      subcategorias: data?.subcategorias || [], // Asegurar que siempre sea un array
    } as Categoria
  } catch (error) {
    console.error('Error obteniendo categoría:', error)
    return null
  }
}

export async function createCategoria(categoria: Omit<Categoria, 'id'>): Promise<string | null> {
  try {
    const docRef = await db.collection(COLLECTION_NAME).add({
      ...categoria,
      fechaCreacion: new Date(),
    })
    return docRef.id
  } catch (error) {
    console.error('Error creando categoría:', error)
    return null
  }
}

export async function updateCategoria(id: string, categoria: Partial<Categoria>): Promise<boolean> {
  try {
    await db.collection(COLLECTION_NAME).doc(id).update(categoria)
    return true
  } catch (error) {
    console.error('Error actualizando categoría:', error)
    return false
  }
}

export async function deleteCategoria(id: string): Promise<boolean> {
  try {
    await db.collection(COLLECTION_NAME).doc(id).delete()
    return true
  } catch (error) {
    console.error('Error eliminando categoría:', error)
    return false
  }
}

