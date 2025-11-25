"use client"

import { useRouter, useParams } from "next/navigation"
import { GastoForm } from "@/components/forms/gasto-form"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
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
      <div className="container mx-auto py-4 sm:py-8 max-w-4xl">
        <div className="text-center py-8">Cargando gasto...</div>
      </div>
    )
  }

  if (!gasto) {
    return (
      <div className="container mx-auto py-4 sm:py-8 max-w-4xl">
        <div className="text-center py-8">
          <p className="text-muted-foreground mb-4">Gasto no encontrado</p>
          <Button onClick={() => router.push("/gastos")}>
            Volver a Gastos
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
          onClick={() => router.push("/gastos")}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver a Gastos
        </Button>
        <h1 className="text-2xl sm:text-3xl font-bold">Editar Gasto</h1>
        <p className="text-sm sm:text-base text-muted-foreground">Modifica los datos del gasto</p>
      </div>

      <div className="bg-card rounded-lg border p-4 sm:p-6">
        <GastoForm gasto={gasto} onSuccess={handleSuccess} onCancel={handleCancel} />
      </div>
    </div>
  )
}

