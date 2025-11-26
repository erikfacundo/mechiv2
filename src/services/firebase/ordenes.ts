import { db } from '@/lib/firebase-admin'
import { OrdenTrabajo, EstadoOrden, TareaChecklist } from '@/types'

const COLLECTION_NAME = 'ordenes'

function convertToDate(value: any): Date | undefined {
  if (!value) return undefined
  if (value instanceof Date) return value
  if (typeof value === 'string') return new Date(value)
  if (value.toDate && typeof value.toDate === 'function') return value.toDate()
  return undefined
}

export async function getOrdenes(): Promise<OrdenTrabajo[]> {
  try {
    const snapshot = await db.collection(COLLECTION_NAME)
      .orderBy('fechaIngreso', 'desc')
      .get()
    return snapshot.docs.map(doc => {
      const data = doc.data()
      const checklist = data?.checklist || []
      return {
        id: doc.id,
        ...data,
        fechaIngreso: convertToDate(data.fechaIngreso) || new Date(),
        fechaEntrega: convertToDate(data.fechaEntrega),
        fechaRecordatorioMantenimiento: convertToDate(data?.fechaRecordatorioMantenimiento),
        checklist: checklist.map((item: any) => ({
          ...item,
          fechaCompletitud: convertToDate(item.fechaCompletitud),
        })),
        gastos: (data?.gastos || []).map((gasto: any) => ({
          ...gasto,
          fecha: convertToDate(gasto.fecha) || new Date(),
        })),
        fotos: (data?.fotos || []).map((foto: any) => ({
          ...foto,
          fechaHora: convertToDate(foto.fechaHora) || new Date(),
        })),
        porcentajeCompletitud: data?.porcentajeCompletitud || calcularProgreso(checklist),
      }
    }) as OrdenTrabajo[]
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
    
    const data = ordenSnap.data()
    
    // Procesar checklist
    const checklist = data?.checklist?.map((item: any) => ({
      ...item,
      fechaCompletitud: convertToDate(item.fechaCompletitud),
    })) || []
    
    // Procesar gastos
    const gastos = data?.gastos?.map((gasto: any) => ({
      ...gasto,
      fecha: convertToDate(gasto.fecha) || new Date(),
    })) || []
    
    // Procesar fotos
    const fotos = data?.fotos?.map((foto: any) => ({
      ...foto,
      fechaHora: convertToDate(foto.fechaHora) || new Date(),
    })) || []
    
    return {
      id: ordenSnap.id,
      ...data,
      fechaIngreso: convertToDate(data?.fechaIngreso) || new Date(),
      fechaEntrega: convertToDate(data?.fechaEntrega),
      fechaRecordatorioMantenimiento: convertToDate(data?.fechaRecordatorioMantenimiento),
      checklist,
      gastos,
      fotos,
      porcentajeCompletitud: data?.porcentajeCompletitud || calcularProgreso(checklist),
    } as OrdenTrabajo
  } catch (error) {
    console.error('Error obteniendo orden:', error)
    return null
  }
}

// Calcular progreso basado en checklist
export function calcularProgreso(checklist: TareaChecklist[]): number {
  if (!checklist || checklist.length === 0) {
    return 0
  }
  
  const completadas = checklist.filter(t => t.completado).length
  return Math.round((completadas / checklist.length) * 100)
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
    return snapshot.docs.map(doc => {
      const data = doc.data()
      return {
        id: doc.id,
        ...data,
        fechaIngreso: convertToDate(data.fechaIngreso) || new Date(),
        fechaEntrega: convertToDate(data.fechaEntrega),
      }
    }) as OrdenTrabajo[]
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
    return snapshot.docs.map(doc => {
      const data = doc.data()
      return {
        id: doc.id,
        ...data,
        fechaIngreso: convertToDate(data.fechaIngreso) || new Date(),
        fechaEntrega: convertToDate(data.fechaEntrega),
      }
    }) as OrdenTrabajo[]
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

    // Calcular progreso inicial si hay checklist
    const porcentajeCompletitud = orden.checklist 
      ? calcularProgreso(orden.checklist)
      : 0

    // Procesar fechas
    const ordenData: any = {
      ...orden,
      numeroOrden,
      fechaIngreso: new Date(),
      porcentajeCompletitud,
    }
    
    // Solo agregar fechaEntrega si existe (Firestore no acepta undefined)
    if (orden.fechaEntrega) {
      ordenData.fechaEntrega = new Date(orden.fechaEntrega)
    } else {
      delete ordenData.fechaEntrega
    }
    
    // Solo agregar fechaRecordatorioMantenimiento si existe
    if (orden.fechaRecordatorioMantenimiento) {
      ordenData.fechaRecordatorioMantenimiento = new Date(orden.fechaRecordatorioMantenimiento)
    } else {
      delete ordenData.fechaRecordatorioMantenimiento
    }
    
    // Procesar checklist
    if (orden.checklist && orden.checklist.length > 0) {
      ordenData.checklist = orden.checklist.map(item => {
        const itemData: any = {
          ...item,
        }
        if (item.fechaCompletitud) {
          itemData.fechaCompletitud = new Date(item.fechaCompletitud)
        } else {
          delete itemData.fechaCompletitud
        }
        return itemData
      })
    } else {
      delete ordenData.checklist
    }
    
    // Procesar gastos
    if (orden.gastos && orden.gastos.length > 0) {
      ordenData.gastos = orden.gastos.map(gasto => ({
        ...gasto,
        fecha: gasto.fecha ? new Date(gasto.fecha) : new Date(),
      }))
    } else {
      delete ordenData.gastos
    }
    
    // Procesar fotos
    if (orden.fotos && orden.fotos.length > 0) {
      ordenData.fotos = orden.fotos.map(foto => {
        // Asegurar que fechaHora sea un Date válido
        let fechaHora: Date
        if (foto.fechaHora instanceof Date) {
          fechaHora = foto.fechaHora
        } else if (typeof foto.fechaHora === 'string') {
          fechaHora = new Date(foto.fechaHora)
        } else {
          fechaHora = new Date()
        }
        
        // Validar que la fecha sea válida
        if (isNaN(fechaHora.getTime())) {
          fechaHora = new Date()
        }
        
        const fotoData: any = {
          ...foto,
          fechaHora,
        }
        
        // Eliminar campos undefined
        if (!fotoData.descripcion) {
          delete fotoData.descripcion
        }
        
        return fotoData
      })
    } else {
      delete ordenData.fotos
    }

    // Eliminar todos los campos undefined antes de guardar
    const cleanData: any = {}
    for (const key in ordenData) {
      if (ordenData[key] !== undefined) {
        cleanData[key] = ordenData[key]
      }
    }

    // Validar tamaño del documento (Firestore tiene un límite de 1MB)
    // Estimar el tamaño serializando a JSON
    const estimatedSize = JSON.stringify(cleanData).length
    const maxSize = 1 * 1024 * 1024 // 1MB en bytes
    
    if (estimatedSize > maxSize) {
      // Si el documento es demasiado grande, probablemente son las fotos
      const fotosSize = cleanData.fotos 
        ? JSON.stringify(cleanData.fotos).length 
        : 0
      const sizeMB = (estimatedSize / 1024 / 1024).toFixed(2)
      const fotosMB = (fotosSize / 1024 / 1024).toFixed(2)
      const numFotos = cleanData.fotos?.length || 0
      
      throw new Error(
        `El documento es demasiado grande (${sizeMB}MB). ` +
        `Las ${numFotos} foto(s) ocupan ${fotosMB}MB. ` +
        `Firestore tiene un límite de 1MB por documento. ` +
        `Por favor, elimina las fotos actuales y vuelve a subirlas (se comprimirán automáticamente), ` +
        `o reduce el número de fotos.`
      )
    }

    const docRef = await db.collection(COLLECTION_NAME).add(cleanData)
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
    
    if (orden.fechaRecordatorioMantenimiento) {
      updateData.fechaRecordatorioMantenimiento = new Date(orden.fechaRecordatorioMantenimiento)
    }
    
    if (orden.checklist) {
      updateData.porcentajeCompletitud = calcularProgreso(orden.checklist)
      
      updateData.checklist = orden.checklist.map(item => {
        const itemData: any = {
          ...item,
        }
        if (item.fechaCompletitud) {
          itemData.fechaCompletitud = new Date(item.fechaCompletitud)
        } else {
          delete itemData.fechaCompletitud
        }
        if (!itemData.notas) {
          delete itemData.notas
        }
        if (!itemData.tareaPadre) {
          delete itemData.tareaPadre
        }
        return itemData
      })
    } else {
      delete updateData.checklist
    }
    
    if (orden.gastos) {
      updateData.gastos = orden.gastos.map(gasto => ({
        ...gasto,
        fecha: gasto.fecha ? new Date(gasto.fecha) : new Date(),
      }))
    } else {
      delete updateData.gastos
    }
    
    if (orden.fotos) {
      updateData.fotos = orden.fotos.map(foto => {
        let fechaHora: Date
        if (foto.fechaHora instanceof Date) {
          fechaHora = foto.fechaHora
        } else if (typeof foto.fechaHora === 'string') {
          fechaHora = new Date(foto.fechaHora)
        } else {
          fechaHora = new Date()
        }
        
        if (isNaN(fechaHora.getTime())) {
          fechaHora = new Date()
        }
        
        const fotoData: any = {
          ...foto,
          fechaHora,
        }
        
        if (!fotoData.descripcion) {
          delete fotoData.descripcion
        }
        
        return fotoData
      })
    } else {
      delete updateData.fotos
    }

    if (orden.fechaEntrega) {
      updateData.fechaEntrega = new Date(orden.fechaEntrega)
    } else {
      delete updateData.fechaEntrega
    }
    
    if (orden.fechaRecordatorioMantenimiento) {
      updateData.fechaRecordatorioMantenimiento = new Date(orden.fechaRecordatorioMantenimiento)
    } else {
      delete updateData.fechaRecordatorioMantenimiento
    }

    const cleanData: any = {}
    for (const key in updateData) {
      if (updateData[key] !== undefined) {
        cleanData[key] = updateData[key]
      }
    }
    
    await db.collection(COLLECTION_NAME).doc(id).update(cleanData)
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

