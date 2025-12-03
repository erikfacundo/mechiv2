import { getProveedores } from "@/services/firebase/proveedores"
import { ProveedoresClient } from "./proveedores-client"

// Forzar renderizado dinámico para evitar errores en build estático
export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function ProveedoresPage() {
  // Fetch en el servidor con manejo de errores
  let proveedores = []
  
  try {
    proveedores = await getProveedores() || []
  } catch (error) {
    console.error('Error obteniendo datos en ProveedoresPage:', error)
  }
  
  return <ProveedoresClient proveedores={proveedores} />
}
