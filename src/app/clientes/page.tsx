import { getClientes } from "@/services/firebase/clientes"
import { ClientesClient } from "./clientes-client"

export default async function ClientesPage() {
  // Fetch en el servidor
  const clientes = await getClientes()

  return <ClientesClient clientes={clientes} />
}
