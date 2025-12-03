import { getVehiculos } from "@/services/firebase/vehiculos"
import { getClientes } from "@/services/firebase/clientes"
import { VehiculosClient } from "./vehiculos-client"
import { Vehiculo, Cliente } from "@/types"

// Forzar renderizado dinámico para evitar errores en build estático
export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function VehiculosPage() {
  // Fetch en el servidor con manejo de errores
  let vehiculos: Vehiculo[] = []
  let clientes: Cliente[] = []
  
  try {
    const [vehiculosData, clientesData] = await Promise.all([
      getVehiculos(),
      getClientes(),
    ])
    vehiculos = vehiculosData || []
    clientes = clientesData || []
  } catch (error) {
    console.error('Error obteniendo datos en VehiculosPage:', error)
    // Continuar con arrays vacíos si hay error
  }

  return <VehiculosClient vehiculos={vehiculos} clientes={clientes} />
}
