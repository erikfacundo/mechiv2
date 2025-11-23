import { getCategorias } from "@/services/firebase/categorias"
import { CategoriasClient } from "./categorias-client"

export default async function CategoriasPage() {
  // Fetch en el servidor
  const categorias = await getCategorias()

  return <CategoriasClient categorias={categorias} />
}
