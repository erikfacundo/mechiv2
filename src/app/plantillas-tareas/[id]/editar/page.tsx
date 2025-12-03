"use client"

import { useRouter, useParams } from "next/navigation"
import { PlantillaTareaForm } from "@/components/forms/plantilla-tarea-form"
import { FormPageLayout } from "@/components/ui/form-page-layout"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { useState, useEffect } from "react"
import { PlantillaTarea } from "@/types"

export default function EditarPlantillaTareaPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string
  const { toast } = useToast()
  const [plantilla, setPlantilla] = useState<PlantillaTarea | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPlantilla = async () => {
      try {
        const response = await fetch(`/api/plantillas-tareas/${id}`)
        if (!response.ok) throw new Error("Error al obtener plantilla")
        const data = await response.json()
        setPlantilla(data)
      } catch (error) {
        toast({
          title: "Error",
          description: "No se pudo cargar la plantilla",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }
    if (id) fetchPlantilla()
  }, [id, toast])

  const handleSuccess = () => {
    toast({
      title: "Plantilla actualizada",
      description: "La plantilla se ha actualizado exitosamente.",
    })
    router.push("/plantillas-tareas")
  }

  const handleCancel = () => {
    router.push("/plantillas-tareas")
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-gray-500 dark:text-gray-400">Cargando plantilla...</p>
        </div>
      </div>
    )
  }

  if (!plantilla) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-gray-500 dark:text-gray-400 mb-4">Plantilla no encontrada</p>
          <Button onClick={() => router.push("/plantillas-tareas")}>
            Volver a Plantillas
          </Button>
        </div>
      </div>
    )
  }

  return (
    <FormPageLayout
      title="Editar Plantilla de Tarea"
      description="Modifica los datos de la plantilla"
      backUrl="/plantillas-tareas"
    >
      <PlantillaTareaForm plantilla={plantilla} onSuccess={handleSuccess} onCancel={handleCancel} />
    </FormPageLayout>
  )
}

