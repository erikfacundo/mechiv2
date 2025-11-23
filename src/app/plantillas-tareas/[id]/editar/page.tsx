"use client"

import { useRouter, useParams } from "next/navigation"
import { PlantillaTareaForm } from "@/components/forms/plantilla-tarea-form"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
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
      <div className="container mx-auto py-8 max-w-4xl">
        <div className="text-center py-8">Cargando plantilla...</div>
      </div>
    )
  }

  if (!plantilla) {
    return (
      <div className="container mx-auto py-8 max-w-4xl">
        <div className="text-center py-8">
          <p className="text-muted-foreground mb-4">Plantilla no encontrada</p>
          <Button onClick={() => router.push("/plantillas-tareas")}>
            Volver a Plantillas
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => router.push("/plantillas-tareas")}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver a Plantillas
        </Button>
        <h1 className="text-3xl font-bold">Editar Plantilla de Tarea</h1>
        <p className="text-muted-foreground">Modifica los datos de la plantilla</p>
      </div>

      <div className="bg-card rounded-lg border p-6">
        <PlantillaTareaForm plantilla={plantilla} onSuccess={handleSuccess} onCancel={handleCancel} />
      </div>
    </div>
  )
}

