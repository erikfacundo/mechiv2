import { getOrdenes } from "@/services/firebase/ordenes"
import { getClientes } from "@/services/firebase/clientes"
import { getVehiculos } from "@/services/firebase/vehiculos"
import { DashboardClient } from "./dashboard-client"

export default async function DashboardPage() {
  // Fetch en el servidor
  const [ordenes, clientes, vehiculos] = await Promise.all([
    getOrdenes(),
    getClientes(),
    getVehiculos(),
  ])

  return <DashboardClient ordenes={ordenes} clientes={clientes} vehiculos={vehiculos} />
}
