import { getOrdenes } from "@/services/firebase/ordenes"
import { getClientes } from "@/services/firebase/clientes"
import { getVehiculos } from "@/services/firebase/vehiculos"
import { OrdenesClient } from "./ordenes-client"
import { OrdenTrabajo, Cliente, Vehiculo } from "@/types"

// Forzar renderizado dinámico para evitar errores en build estático
export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function OrdenesPage() {
  // Fetch en el servidor con manejo de errores
  let ordenes: OrdenTrabajo[] = []
  let clientes: Cliente[] = []
  let vehiculos: Vehiculo[] = []
  
  try {
    const [ordenesData, clientesData, vehiculosData] = await Promise.all([
      getOrdenes(),
      getClientes(),
      getVehiculos(),
    ])
    ordenes = ordenesData || []
    clientes = clientesData || []
    vehiculos = vehiculosData || []
  } catch (error) {
    console.error('Error obteniendo datos en OrdenesPage:', error)
  }

  return <OrdenesClient ordenes={ordenes} clientes={clientes} vehiculos={vehiculos} />
}
