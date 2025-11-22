import { Cliente, Vehiculo, OrdenTrabajo } from '@/types';

export const clientesMock: Cliente[] = [
  {
    id: '1',
    nombre: 'Juan',
    apellido: 'Pérez',
    dni: '12345678',
    telefono: '+54 11 1234-5678',
    email: 'juan.perez@email.com',
    direccion: 'Av. Corrientes 1234, CABA',
    fechaRegistro: new Date('2024-01-15'),
  },
  {
    id: '2',
    nombre: 'María',
    apellido: 'González',
    dni: '23456789',
    telefono: '+54 11 2345-6789',
    email: 'maria.gonzalez@email.com',
    direccion: 'Av. Santa Fe 5678, CABA',
    fechaRegistro: new Date('2024-02-20'),
  },
  {
    id: '3',
    nombre: 'Carlos',
    apellido: 'Rodríguez',
    dni: '34567890',
    telefono: '+54 11 3456-7890',
    email: 'carlos.rodriguez@email.com',
    direccion: 'Av. Libertador 9012, CABA',
    fechaRegistro: new Date('2024-03-10'),
  },
  {
    id: '4',
    nombre: 'Ana',
    apellido: 'Martínez',
    dni: '45678901',
    telefono: '+54 11 4567-8901',
    email: 'ana.martinez@email.com',
    direccion: 'Av. Cabildo 3456, CABA',
    fechaRegistro: new Date('2024-04-05'),
  },
  {
    id: '5',
    nombre: 'Luis',
    apellido: 'Fernández',
    dni: '56789012',
    telefono: '+54 11 5678-9012',
    email: 'luis.fernandez@email.com',
    direccion: 'Av. Rivadavia 7890, CABA',
    fechaRegistro: new Date('2024-05-12'),
  },
];

export const vehiculosMock: Vehiculo[] = [
  {
    id: '1',
    clienteId: '1',
    marca: 'Ford',
    modelo: 'Focus',
    año: 2020,
    patente: 'ABC123',
    kilometraje: 45000,
    color: 'Blanco',
    tipoCombustible: 'Nafta',
  },
  {
    id: '2',
    clienteId: '1',
    marca: 'Chevrolet',
    modelo: 'Cruze',
    año: 2019,
    patente: 'DEF456',
    kilometraje: 52000,
    color: 'Negro',
    tipoCombustible: 'Nafta',
  },
  {
    id: '3',
    clienteId: '2',
    marca: 'Volkswagen',
    modelo: 'Gol',
    año: 2021,
    patente: 'GHI789',
    kilometraje: 30000,
    color: 'Rojo',
    tipoCombustible: 'Nafta',
  },
  {
    id: '4',
    clienteId: '3',
    marca: 'Toyota',
    modelo: 'Corolla',
    año: 2022,
    patente: 'JKL012',
    kilometraje: 15000,
    color: 'Gris',
    tipoCombustible: 'Híbrido',
  },
  {
    id: '5',
    clienteId: '4',
    marca: 'Fiat',
    modelo: 'Cronos',
    año: 2020,
    patente: 'MNO345',
    kilometraje: 38000,
    color: 'Azul',
    tipoCombustible: 'Nafta',
  },
  {
    id: '6',
    clienteId: '5',
    marca: 'Peugeot',
    modelo: '208',
    año: 2021,
    patente: 'PQR678',
    kilometraje: 28000,
    color: 'Blanco',
    tipoCombustible: 'Nafta',
  },
];

export const ordenesMock: OrdenTrabajo[] = [
  {
    id: '1',
    clienteId: '1',
    vehiculoId: '1',
    numeroOrden: 'OT-2024-001',
    fechaIngreso: new Date('2024-06-01'),
    fechaEntrega: new Date('2024-06-05'),
    estado: 'Entregado',
    descripcion: 'Cambio de aceite y filtros',
    servicios: ['Cambio de aceite', 'Cambio de filtro de aceite', 'Cambio de filtro de aire'],
    costoTotal: 15000,
    observaciones: 'Vehículo en buen estado general',
  },
  {
    id: '2',
    clienteId: '2',
    vehiculoId: '3',
    numeroOrden: 'OT-2024-002',
    fechaIngreso: new Date('2024-06-10'),
    estado: 'En Proceso',
    descripcion: 'Reparación de frenos',
    servicios: ['Revisión de frenos', 'Cambio de pastillas delanteras', 'Rectificado de discos'],
    costoTotal: 35000,
    observaciones: 'Pastillas muy desgastadas',
  },
  {
    id: '3',
    clienteId: '3',
    vehiculoId: '4',
    numeroOrden: 'OT-2024-003',
    fechaIngreso: new Date('2024-06-15'),
    estado: 'Pendiente',
    descripcion: 'Service completo',
    servicios: ['Service completo', 'Revisión general', 'Alineación y balanceo'],
    costoTotal: 45000,
  },
  {
    id: '4',
    clienteId: '4',
    vehiculoId: '5',
    numeroOrden: 'OT-2024-004',
    fechaIngreso: new Date('2024-06-12'),
    estado: 'Completado',
    descripcion: 'Reparación de aire acondicionado',
    servicios: ['Recarga de gas', 'Limpieza de filtros', 'Revisión de compresor'],
    costoTotal: 28000,
    observaciones: 'Sistema funcionando correctamente',
  },
  {
    id: '5',
    clienteId: '5',
    vehiculoId: '6',
    numeroOrden: 'OT-2024-005',
    fechaIngreso: new Date('2024-06-18'),
    estado: 'Pendiente',
    descripcion: 'Cambio de neumáticos',
    servicios: ['Cambio de 4 neumáticos', 'Alineación', 'Balanceo'],
    costoTotal: 120000,
  },
];

// Funciones helper para obtener datos relacionados
export const getClienteById = (id: string): Cliente | undefined => {
  return clientesMock.find(c => c.id === id);
};

export const getVehiculoById = (id: string): Vehiculo | undefined => {
  return vehiculosMock.find(v => v.id === id);
};

export const getOrdenesByEstado = (estado: string): OrdenTrabajo[] => {
  if (estado === 'Todos') return ordenesMock;
  return ordenesMock.filter(o => o.estado === estado);
};

