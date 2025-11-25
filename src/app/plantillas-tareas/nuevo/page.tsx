"use client"

import { useRouter } from "next/navigation"
import { PlantillaTareaForm } from "@/components/forms/plantilla-tarea-form"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
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
    <div className="container mx-auto py-4 sm:py-8 max-w-4xl">
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => router.push("/plantillas-tareas")}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver a Plantillas
        </Button>
        <h1 className="text-2xl sm:text-3xl font-bold">Nueva Plantilla de Tarea</h1>
        <p className="text-sm sm:text-base text-muted-foreground">Completa los datos de la nueva plantilla</p>
      </div>

      <div className="bg-card rounded-lg border p-4 sm:p-6">
        <PlantillaTareaForm onSuccess={handleSuccess} onCancel={handleCancel} />
      </div>
    </div>
  )
}

