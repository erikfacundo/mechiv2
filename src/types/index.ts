export interface Cliente {
  id: string;
  nombre: string;
  apellido: string;
  dni: string;
  telefono: string;
  email: string;
  direccion?: string;
  fechaRegistro: Date;
}

export interface Vehiculo {
  id: string;
  clienteId: string;
  marca: string;
  modelo: string;
  año: number;
  patente: string;
  kilometraje: number;
  color?: string;
  tipoCombustible?: string;
}

export type EstadoOrden = 'Pendiente' | 'En Proceso' | 'Completado' | 'Entregado';

export interface TareaChecklist {
  id: string;
  tarea: string;
  tareaPadre?: string; // Si es una subtarea, referencia a la tarea padre
  completado: boolean;
  notas?: string;
  fechaCompletitud?: Date;
}

export interface GastoOrden {
  id: string;
  descripcion: string;
  monto: number;
  facturaUrl?: string; // URL de la factura subida
  fecha: Date;
}

export interface OrdenTrabajo {
  id: string;
  clienteId: string;
  vehiculoId: string;
  numeroOrden: string;
  fechaIngreso: Date;
  fechaEntrega?: Date;
  estado: EstadoOrden;
  descripcion: string;
  servicios: string[];
  costoTotal: number;
  observaciones?: string;
  // Nuevos campos
  checklist?: TareaChecklist[];
  gastos?: GastoOrden[];
  porcentajeCompletitud?: number;
  esMantenimiento?: boolean;
  fechaRecordatorioMantenimiento?: Date;
}

export interface Categoria {
  id: string;
  nombre: string;
  descripcion?: string;
  color?: string;
  activa: boolean;
  fechaCreacion: Date;
}

export interface Cobro {
  id: string;
  ordenId: string;
  clienteId: string;
  monto: number;
  fecha: Date;
  metodoPago: 'Efectivo' | 'Tarjeta' | 'Transferencia' | 'Cheque';
  estado: 'Pendiente' | 'Completado' | 'Cancelado';
  numeroComprobante?: string;
  observaciones?: string;
}

export interface Gasto {
  id: string;
  proveedorId?: string;
  categoria: string;
  descripcion: string;
  monto: number;
  fecha: Date;
  metodoPago: 'Efectivo' | 'Tarjeta' | 'Transferencia' | 'Cheque';
  numeroComprobante?: string;
  observaciones?: string;
}

export interface PlantillaTarea {
  id: string;
  nombre: string;
  descripcion: string;
  categoria?: string;
  tiempoEstimado?: number; // en minutos
  costoEstimado?: number;
  pasos: string[];
  activa: boolean;
  fechaCreacion: Date;
  // Nuevos campos para sistema retroactivo
  tareaPadre?: string; // Si es una subtarea, referencia a la tarea padre
  subtareas?: string[]; // Si es tarea padre, lista de IDs de subtareas
  esTareaPadre: boolean;
  usoCount?: number; // Contador de uso para ordenar por más usadas
}

export interface Proveedor {
  id: string;
  nombre: string;
  razonSocial?: string;
  cuit?: string;
  telefono: string;
  email?: string;
  direccion?: string;
  tipo: 'Repuestos' | 'Servicios' | 'Insumos' | 'Otros';
  activo: boolean;
  fechaRegistro: Date;
}

export interface Turno {
  id: string;
  clienteId: string;
  vehiculoId: string;
  fecha: Date;
  hora: string;
  descripcion: string;
  estado: 'Pendiente' | 'Confirmado' | 'Cancelado' | 'Completado';
  observaciones?: string;
  fechaCreacion: Date;
}

export interface Mantenimiento {
  id: string;
  ordenId: string;
  clienteId: string;
  vehiculoId: string;
  fechaRecordatorio: Date;
  completado: boolean;
  fechaCompletitud?: Date;
  observaciones?: string;
  fechaCreacion: Date;
}

