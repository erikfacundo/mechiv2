import { getPlantillasTareas } from "@/services/firebase/plantillas-tareas"
import { PlantillasTareasClient } from "./plantillas-tareas-client"
import { PlantillaTarea } from "@/types"

// Forzar renderizado dinámico para evitar errores en build estático
export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function PlantillasTareasPage() {
  // Fetch en el servidor con manejo de errores
  let plantillas: PlantillaTarea[] = []
  
  try {
    plantillas = await getPlantillasTareas() || []
  } catch (error) {
    console.error('Error obteniendo datos en PlantillasTareasPage:', error)
  }
  
  return <PlantillasTareasClient plantillas={plantillas} />
}
