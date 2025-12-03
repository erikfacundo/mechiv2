import { getCobros } from "@/services/firebase/cobros"
import { CobrosClient } from "./cobros-client"

// Forzar renderizado dinámico para evitar errores en build estático
export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function CobrosPage() {
  // Fetch en el servidor con manejo de errores
  let cobros = []
  
  try {
    cobros = await getCobros() || []
  } catch (error) {
    console.error('Error obteniendo datos en CobrosPage:', error)
  }
  
  return <CobrosClient cobros={cobros} />
}
