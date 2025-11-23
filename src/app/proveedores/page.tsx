import { getProveedores } from "@/services/firebase/proveedores"
import { ProveedoresClient } from "./proveedores-client"

export default async function ProveedoresPage() {
  const proveedores = await getProveedores()
  return <ProveedoresClient proveedores={proveedores} />
}
