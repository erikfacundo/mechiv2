import { getClientes } from "@/services/firebase/clientes"
import { ClientesClient } from "./clientes-client"

// Forzar renderizado dinámico para evitar errores en build estático
export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function ClientesPage() {
  // Fetch en el servidor con manejo de errores
  let clientes = []
  
  try {
    clientes = await getClientes() || []
  } catch (error) {
    console.error('Error obteniendo datos en ClientesPage:', error)
  }

  return <ClientesClient clientes={clientes} />
}
