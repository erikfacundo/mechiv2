import { getVehiculos } from "@/services/firebase/vehiculos"
import { getClientes } from "@/services/firebase/clientes"
import { VehiculosClient } from "./vehiculos-client"

export default async function VehiculosPage() {
  // Fetch en el servidor
  const [vehiculos, clientes] = await Promise.all([
    getVehiculos(),
    getClientes(),
  ])

  return <VehiculosClient vehiculos={vehiculos} clientes={clientes} />
}
