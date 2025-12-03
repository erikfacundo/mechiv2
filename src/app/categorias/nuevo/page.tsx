"use client"

import { useRouter } from "next/navigation"
import { CategoriaForm } from "@/components/forms/categoria-form"
import { FormPageLayout } from "@/components/ui/form-page-layout"
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
    <FormPageLayout
      title="Nueva Tarea Principal"
      description="Crea una nueva tarea principal (categoría) y define sus subtareas (subcategorías)"
      backUrl="/categorias"
    >
      <CategoriaForm onSuccess={handleSuccess} onCancel={handleCancel} />
    </FormPageLayout>
  )
}

