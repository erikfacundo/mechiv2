"use client"

import { useRouter, useParams } from "next/navigation"
import { CategoriaForm } from "@/components/forms/categoria-form"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
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
      <div className="container mx-auto py-4 sm:py-8 max-w-4xl">
        <div className="text-center py-8">Cargando categoría...</div>
      </div>
    )
  }

  if (!categoria) {
    return (
      <div className="container mx-auto py-4 sm:py-8 max-w-4xl">
        <div className="text-center py-8">
          <p className="text-muted-foreground mb-4">Categoría no encontrada</p>
          <Button onClick={() => router.push("/categorias")}>
            Volver a Categorías
          </Button>
        </div>
      </div>
    )
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
        <h1 className="text-2xl sm:text-3xl font-bold">Editar Tarea Principal</h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          Modifica la tarea principal y sus subtareas (subcategorías)
        </p>
      </div>

      <div className="bg-card rounded-lg border p-4 sm:p-6">
        <CategoriaForm categoria={categoria} onSuccess={handleSuccess} onCancel={handleCancel} />
      </div>
    </div>
  )
}

