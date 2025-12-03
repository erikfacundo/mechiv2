import { getGastos } from "@/services/firebase/gastos"
import { GastosClient } from "./gastos-client"

// Forzar renderizado dinámico para evitar errores en build estático
export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function GastosPage() {
  // Fetch en el servidor con manejo de errores
  let gastos = []
  
  try {
    gastos = await getGastos() || []
  } catch (error) {
    console.error('Error obteniendo datos en GastosPage:', error)
  }
  
  return <GastosClient gastos={gastos} />
}
