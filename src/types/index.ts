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

export interface FotoVehiculo {
  id: string; // ID único de la foto
  dataUrl: string; // Imagen en base64 O URL de R2 (https://...)
  fechaHora: Date; // Fecha y hora exacta de cuando se tomó/subió la foto
  descripcion?: string; // Opcional: descripción de la foto (ej: "Vista frontal", "Daño en paragolpes")
  // Si dataUrl es una URL (empieza con http:// o https://), es una foto almacenada en R2
  // Si dataUrl es base64 (empieza con data:), es una foto almacenada en Firestore
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
  fotos?: FotoVehiculo[]; // Fotos del vehículo (base64 + metadata)
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

export interface FotoOrden {
  id: string; // ID único de la foto
  dataUrl: string; // Imagen en base64 O URL de R2 (https://...)
  fechaHora: Date; // Fecha y hora exacta de cuando se tomó/subió la foto
  tipo: 'inicial' | 'final'; // Estado inicial o final del vehículo
  descripcion?: string; // Opcional: descripción de la foto
  // Si dataUrl es una URL (empieza con http:// o https://), es una foto almacenada en R2
  // Si dataUrl es base64 (empieza con data:), es una foto almacenada en Firestore
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
  manoObra?: number; // Mano de obra cobrada (ganancia real del taller)
  observaciones?: string;
  // Nuevos campos
  checklist?: TareaChecklist[];
  gastos?: GastoOrden[]; // Gastos internos (repuestos/materiales que compramos pero NO cobramos al cliente)
  porcentajeCompletitud?: number;
  esMantenimiento?: boolean;
  fechaRecordatorioMantenimiento?: Date;
  fotos?: FotoOrden[]; // Fotos del estado del vehículo (inicial y final)
}

export interface Categoria {
  id: string;
  nombre: string;
  descripcion?: string;
  color?: string;
  activa: boolean;
  fechaCreacion: Date;
  subcategorias?: string[]; // Subcategorías que se convertirán automáticamente en tareas del checklist
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

export interface Usuario {
  id: string;
  username: string;
  passwordHash: string;
  nombre?: string;
  apellido?: string;
  email?: string;
  activo: boolean;
  fechaCreacion: Date;
  fechaUltimoAcceso?: Date;
}

