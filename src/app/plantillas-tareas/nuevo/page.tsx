"use client"

import { useRouter } from "next/navigation"
import { PlantillaTareaForm } from "@/components/forms/plantilla-tarea-form"
import { FormPageLayout } from "@/components/ui/form-page-layout"
import { useToast } from "@/hooks/use-toast"

export default function NuevaPlantillaTareaPage() {
  const router = useRouter()
  const { toast } = useToast()

  const handleSuccess = () => {
    toast({
      title: "Plantilla creada",
      description: "La plantilla se ha creado exitosamente.",
    })
    router.push("/plantillas-tareas")
  }

  const handleCancel = () => {
    router.push("/plantillas-tareas")
  }

  return (
    <FormPageLayout
      title="Nueva Plantilla de Tarea"
      description="Completa los datos de la nueva plantilla"
      backUrl="/plantillas-tareas"
    >
      <PlantillaTareaForm onSuccess={handleSuccess} onCancel={handleCancel} />
    </FormPageLayout>
  )
}

