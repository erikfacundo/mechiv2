"use client"

import { useRouter, useParams } from "next/navigation"
import { GastoForm } from "@/components/forms/gasto-form"
import { FormPageLayout } from "@/components/ui/form-page-layout"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { useState, useEffect } from "react"
import { Gasto } from "@/types"

export default function EditarGastoPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string
  const { toast } = useToast()
  const [gasto, setGasto] = useState<Gasto | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchGasto = async () => {
      try {
        const response = await fetch(`/api/gastos/${id}`)
        if (!response.ok) throw new Error("Error al obtener gasto")
        const data = await response.json()
        setGasto(data)
      } catch (error) {
        toast({
          title: "Error",
          description: "No se pudo cargar el gasto",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }
    if (id) fetchGasto()
  }, [id, toast])

  const handleSuccess = () => {
    toast({
      title: "Gasto actualizado",
      description: "El gasto se ha actualizado exitosamente.",
    })
    router.push("/gastos")
  }

  const handleCancel = () => {
    router.push("/gastos")
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-gray-500 dark:text-gray-400">Cargando gasto...</p>
        </div>
      </div>
    )
  }

  if (!gasto) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-gray-500 dark:text-gray-400 mb-4">Gasto no encontrado</p>
          <Button onClick={() => router.push("/gastos")}>
            Volver a Gastos
          </Button>
        </div>
      </div>
    )
  }

  return (
    <FormPageLayout
      title="Editar Gasto"
      description="Modifica los datos del gasto"
      backUrl="/gastos"
    >
      <GastoForm gasto={gasto} onSuccess={handleSuccess} onCancel={handleCancel} />
    </FormPageLayout>
  )
}

