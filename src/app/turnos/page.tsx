import { getTurnos } from "@/services/firebase/turnos"
import { getClientes } from "@/services/firebase/clientes"
import { getVehiculos } from "@/services/firebase/vehiculos"
import { TurnosClient } from "./turnos-client"

export default async function TurnosPage() {
  const [turnos, clientes, vehiculos] = await Promise.all([
    getTurnos(),
    getClientes(),
    getVehiculos(),
  ])
  return <TurnosClient turnos={turnos} clientes={clientes} vehiculos={vehiculos} />
}
