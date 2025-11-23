import { db } from '@/lib/firebase-admin'
import { OrdenTrabajo, EstadoOrden, TareaChecklist } from '@/types'

const COLLECTION_NAME = 'ordenes'

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
        fechaIngreso: data.fechaIngreso?.toDate() || new Date(),
        fechaEntrega: data.fechaEntrega?.toDate() || undefined,
        fechaRecordatorioMantenimiento: data?.fechaRecordatorioMantenimiento?.toDate() || undefined,
        checklist: checklist.map((item: any) => ({
          ...item,
          fechaCompletitud: item.fechaCompletitud?.toDate() || undefined,
        })),
        gastos: (data?.gastos || []).map((gasto: any) => ({
          ...gasto,
          fecha: gasto.fecha?.toDate() || new Date(),
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
      fechaCompletitud: item.fechaCompletitud?.toDate() || undefined,
    })) || []
    
    // Procesar gastos
    const gastos = data?.gastos?.map((gasto: any) => ({
      ...gasto,
      fecha: gasto.fecha?.toDate() || new Date(),
    })) || []
    
    return {
      id: ordenSnap.id,
      ...data,
      fechaIngreso: data?.fechaIngreso?.toDate() || new Date(),
      fechaEntrega: data?.fechaEntrega?.toDate() || undefined,
      fechaRecordatorioMantenimiento: data?.fechaRecordatorioMantenimiento?.toDate() || undefined,
      checklist,
      gastos,
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
    
    if (orden.fechaEntrega) {
      ordenData.fechaEntrega = new Date(orden.fechaEntrega)
    }
    
    if (orden.fechaRecordatorioMantenimiento) {
      ordenData.fechaRecordatorioMantenimiento = new Date(orden.fechaRecordatorioMantenimiento)
    }
    
    // Procesar checklist
    if (orden.checklist) {
      ordenData.checklist = orden.checklist.map(item => ({
        ...item,
        fechaCompletitud: item.fechaCompletitud ? new Date(item.fechaCompletitud) : undefined,
      }))
    }
    
    // Procesar gastos
    if (orden.gastos) {
      ordenData.gastos = orden.gastos.map(gasto => ({
        ...gasto,
        fecha: gasto.fecha ? new Date(gasto.fecha) : new Date(),
      }))
    }

    const docRef = await db.collection(COLLECTION_NAME).add(ordenData)
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
    
    // Calcular progreso si hay checklist
    if (orden.checklist) {
      updateData.porcentajeCompletitud = calcularProgreso(orden.checklist)
      
      // Procesar fechas de completitud en checklist
      updateData.checklist = orden.checklist.map(item => ({
        ...item,
        fechaCompletitud: item.fechaCompletitud ? new Date(item.fechaCompletitud) : undefined,
      }))
    }
    
    // Procesar fechas en gastos
    if (orden.gastos) {
      updateData.gastos = orden.gastos.map(gasto => ({
        ...gasto,
        fecha: gasto.fecha ? new Date(gasto.fecha) : new Date(),
      }))
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

