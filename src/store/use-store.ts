import { create } from 'zustand'
import { Cliente, Vehiculo, OrdenTrabajo } from '@/types'

interface AppState {
  clientes: Cliente[]
  vehiculos: Vehiculo[]
  ordenes: OrdenTrabajo[]
  setClientes: (clientes: Cliente[]) => void
  setVehiculos: (vehiculos: Vehiculo[]) => void
  setOrdenes: (ordenes: OrdenTrabajo[]) => void
  addCliente: (cliente: Cliente) => void
  addVehiculo: (vehiculo: Vehiculo) => void
  addOrden: (orden: OrdenTrabajo) => void
  updateOrden: (id: string, orden: Partial<OrdenTrabajo>) => void
}

export const useStore = create<AppState>((set) => ({
  clientes: [],
  vehiculos: [],
  ordenes: [],
  setClientes: (clientes) => set({ clientes }),
  setVehiculos: (vehiculos) => set({ vehiculos }),
  setOrdenes: (ordenes) => set({ ordenes }),
  addCliente: (cliente) =>
    set((state) => ({ clientes: [...state.clientes, cliente] })),
  addVehiculo: (vehiculo) =>
    set((state) => ({ vehiculos: [...state.vehiculos, vehiculo] })),
  addOrden: (orden) =>
    set((state) => ({ ordenes: [...state.ordenes, orden] })),
  updateOrden: (id, orden) =>
    set((state) => ({
      ordenes: state.ordenes.map((o) =>
        o.id === id ? { ...o, ...orden } : o
      ),
    })),
}))

