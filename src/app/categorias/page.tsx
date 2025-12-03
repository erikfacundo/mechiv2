import { getCategorias } from "@/services/firebase/categorias"
import { CategoriasClient } from "./categorias-client"
import { Categoria } from "@/types"

// Forzar renderizado dinámico para evitar errores en build estático
export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function CategoriasPage() {
  // Fetch en el servidor con manejo de errores
  let categorias: Categoria[] = []
  
  try {
    categorias = await getCategorias() || []
  } catch (error) {
    console.error('Error obteniendo datos en CategoriasPage:', error)
  }

  return <CategoriasClient categorias={categorias} />
}
