import { getClientes } from "@/services/firebase/clientes"
import { ClientesClient } from "./clientes-client"
import { Cliente } from "@/types"

// Forzar renderizado dinámico para evitar errores en build estático
export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function ClientesPage() {
  // Fetch en el servidor con manejo de errores
  let clientes: Cliente[] = []
  
  try {
    clientes = await getClientes() || []
  } catch (error) {
    console.error('Error obteniendo datos en ClientesPage:', error)
  }

  return <ClientesClient clientes={clientes} />
}
