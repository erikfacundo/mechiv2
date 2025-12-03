"use client"

import { useRouter, useParams } from "next/navigation"
import { CategoriaForm } from "@/components/forms/categoria-form"
import { FormPageLayout } from "@/components/ui/form-page-layout"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { useState, useEffect } from "react"
import { Categoria } from "@/types"

export default function EditarCategoriaPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string
  const { toast } = useToast()
  const [categoria, setCategoria] = useState<Categoria | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCategoria = async () => {
      try {
        const response = await fetch(`/api/categorias/${id}`)
        if (!response.ok) throw new Error("Error al obtener categoría")
        const data = await response.json()
        setCategoria(data)
      } catch (error) {
        toast({
          title: "Error",
          description: "No se pudo cargar la categoría",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }
    if (id) fetchCategoria()
  }, [id, toast])

  const handleSuccess = () => {
    toast({
      title: "Categoría actualizada",
      description: "La categoría se ha actualizado exitosamente.",
    })
    router.push("/categorias")
  }

  const handleCancel = () => {
    router.push("/categorias")
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-gray-500 dark:text-gray-400">Cargando categoría...</p>
        </div>
      </div>
    )
  }

  if (!categoria) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-gray-500 dark:text-gray-400 mb-4">Categoría no encontrada</p>
          <Button onClick={() => router.push("/categorias")}>
            Volver a Categorías
          </Button>
        </div>
      </div>
    )
  }

  return (
    <FormPageLayout
      title="Editar Tarea Principal"
      description="Modifica la tarea principal y sus subtareas (subcategorías)"
      backUrl="/categorias"
    >
      <CategoriaForm categoria={categoria} onSuccess={handleSuccess} onCancel={handleCancel} />
    </FormPageLayout>
  )
}

