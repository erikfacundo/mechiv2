import { getTurnos } from "@/services/firebase/turnos"
import { getClientes } from "@/services/firebase/clientes"
import { getVehiculos } from "@/services/firebase/vehiculos"
import { TurnosClient } from "./turnos-client"
import { Turno, Cliente, Vehiculo } from "@/types"

// Forzar renderizado dinámico para evitar errores en build estático
export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function TurnosPage() {
  // Fetch en el servidor con manejo de errores
  let turnos: Turno[] = []
  let clientes: Cliente[] = []
  let vehiculos: Vehiculo[] = []
  
  try {
    const [turnosData, clientesData, vehiculosData] = await Promise.all([
      getTurnos(),
      getClientes(),
      getVehiculos(),
    ])
    turnos = turnosData || []
    clientes = clientesData || []
    vehiculos = vehiculosData || []
  } catch (error) {
    console.error('Error obteniendo datos en TurnosPage:', error)
  }
  
  return <TurnosClient turnos={turnos} clientes={clientes} vehiculos={vehiculos} />
}
