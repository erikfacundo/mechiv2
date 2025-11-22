import { Cliente, Vehiculo } from '@/types'

let clientesCache: Cliente[] | null = null
let vehiculosCache: Vehiculo[] | null = null

export async function getClienteById(id: string): Promise<Cliente | null> {
  if (!clientesCache) {
    const response = await fetch('/api/clientes')
    if (response.ok) {
      clientesCache = await response.json()
    }
  }
  return clientesCache?.find(c => c.id === id) || null
}

export async function getVehiculoById(id: string): Promise<Vehiculo | null> {
  if (!vehiculosCache) {
    const response = await fetch('/api/vehiculos')
    if (response.ok) {
      vehiculosCache = await response.json()
    }
  }
  return vehiculosCache?.find(v => v.id === id) || null
}

export function clearCache() {
  clientesCache = null
  vehiculosCache = null
}

