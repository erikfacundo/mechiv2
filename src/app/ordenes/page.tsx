import { getOrdenes } from "@/services/firebase/ordenes"
import { getClientes } from "@/services/firebase/clientes"
import { getVehiculos } from "@/services/firebase/vehiculos"
import { OrdenesClient } from "./ordenes-client"

export default async function OrdenesPage() {
  // Fetch en el servidor
  const [ordenes, clientes, vehiculos] = await Promise.all([
    getOrdenes(),
    getClientes(),
    getVehiculos(),
  ])

  return <OrdenesClient ordenes={ordenes} clientes={clientes} vehiculos={vehiculos} />
}
