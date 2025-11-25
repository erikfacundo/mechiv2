"use client"

import { useRouter } from "next/navigation"
import { CategoriaForm } from "@/components/forms/categoria-form"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function NuevaCategoriaPage() {
  const router = useRouter()
  const { toast } = useToast()

  const handleSuccess = () => {
    toast({
      title: "Categoría creada",
      description: "La categoría se ha creado exitosamente.",
    })
    router.push("/categorias")
  }

  const handleCancel = () => {
    router.push("/categorias")
  }

  return (
    <div className="container mx-auto py-4 sm:py-8 max-w-4xl">
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => router.push("/categorias")}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver a Categorías
        </Button>
        <h1 className="text-2xl sm:text-3xl font-bold">Nueva Tarea Principal</h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          Crea una nueva tarea principal (categoría) y define sus subtareas (subcategorías)
        </p>
      </div>

      <div className="bg-card rounded-lg border p-4 sm:p-6">
        <CategoriaForm onSuccess={handleSuccess} onCancel={handleCancel} />
      </div>
    </div>
  )
}

