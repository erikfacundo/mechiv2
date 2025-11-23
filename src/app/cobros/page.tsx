import { getCobros } from "@/services/firebase/cobros"
import { CobrosClient } from "./cobros-client"

export default async function CobrosPage() {
  const cobros = await getCobros()
  return <CobrosClient cobros={cobros} />
}
