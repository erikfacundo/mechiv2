import { getPlantillasTareas } from "@/services/firebase/plantillas-tareas"
import { PlantillasTareasClient } from "./plantillas-tareas-client"

export default async function PlantillasTareasPage() {
  const plantillas = await getPlantillasTareas()
  return <PlantillasTareasClient plantillas={plantillas} />
}
