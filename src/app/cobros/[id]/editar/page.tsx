"use client"

import { useRouter, useParams } from "next/navigation"
import { CobroForm } from "@/components/forms/cobro-form"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
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
      <div className="container mx-auto py-8 max-w-4xl">
        <div className="text-center py-8">Cargando cobro...</div>
      </div>
    )
  }

  if (!cobro) {
    return (
      <div className="container mx-auto py-8 max-w-4xl">
        <div className="text-center py-8">
          <p className="text-muted-foreground mb-4">Cobro no encontrado</p>
          <Button onClick={() => router.push("/cobros")}>
            Volver a Cobros
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
          onClick={() => router.push("/cobros")}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver a Cobros
        </Button>
        <h1 className="text-3xl font-bold">Editar Cobro</h1>
        <p className="text-muted-foreground">Modifica los datos del cobro</p>
      </div>

      <div className="bg-card rounded-lg border p-6">
        <CobroForm cobro={cobro} onSuccess={handleSuccess} onCancel={handleCancel} />
      </div>
    </div>
  )
}

