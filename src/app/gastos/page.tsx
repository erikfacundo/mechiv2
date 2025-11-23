import { getGastos } from "@/services/firebase/gastos"
import { GastosClient } from "./gastos-client"

export default async function GastosPage() {
  const gastos = await getGastos()
  return <GastosClient gastos={gastos} />
}
