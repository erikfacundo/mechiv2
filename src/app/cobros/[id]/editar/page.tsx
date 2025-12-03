"use client"

import { useRouter, useParams } from "next/navigation"
import { CobroForm } from "@/components/forms/cobro-form"
import { FormPageLayout } from "@/components/ui/form-page-layout"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { useState, useEffect } from "react"
import { Cobro } from "@/types"

export default function EditarCobroPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string
  const { toast } = useToast()
  const [cobro, setCobro] = useState<Cobro | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCobro = async () => {
      try {
        const response = await fetch(`/api/cobros/${id}`)
        if (!response.ok) throw new Error("Error al obtener cobro")
        const data = await response.json()
        setCobro(data)
      } catch (error) {
        toast({
          title: "Error",
          description: "No se pudo cargar el cobro",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }
    if (id) fetchCobro()
  }, [id, toast])

  const handleSuccess = () => {
    toast({
      title: "Cobro actualizado",
      description: "El cobro se ha actualizado exitosamente.",
    })
    router.push("/cobros")
  }

  const handleCancel = () => {
    router.push("/cobros")
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-gray-500 dark:text-gray-400">Cargando cobro...</p>
        </div>
      </div>
    )
  }

  if (!cobro) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-gray-500 dark:text-gray-400 mb-4">Cobro no encontrado</p>
          <Button onClick={() => router.push("/cobros")}>
            Volver a Cobros
          </Button>
        </div>
      </div>
    )
  }

  return (
    <FormPageLayout
      title="Editar Cobro"
      description="Modifica los datos del cobro"
      backUrl="/cobros"
    >
      <CobroForm cobro={cobro} onSuccess={handleSuccess} onCancel={handleCancel} />
    </FormPageLayout>
  )
}

