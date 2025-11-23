"use client"

import { useRouter, useParams } from "next/navigation"
import { OrdenForm } from "@/components/forms/orden-form"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { useOrden } from "@/hooks/use-ordenes"
import { useToast } from "@/hooks/use-toast"

export default function EditarOrdenPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string
  const { orden, loading } = useOrden(id)
  const { toast } = useToast()

  const handleSuccess = () => {
    toast({
      title: "Orden actualizada",
      description: "La orden se ha actualizado exitosamente.",
    })
    router.push("/ordenes")
  }

  const handleCancel = () => {
    router.push("/ordenes")
  }

  if (loading) {
    return (
      <div className="container mx-auto py-8 max-w-5xl">
        <div className="text-center py-8">Cargando orden...</div>
      </div>
    )
  }

  if (!orden) {
    return (
      <div className="container mx-auto py-8 max-w-5xl">
        <div className="text-center py-8">
          <p className="text-muted-foreground mb-4">Orden no encontrada</p>
          <Button onClick={() => router.push("/ordenes")}>
            Volver a Órdenes
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 max-w-5xl">
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => router.push("/ordenes")}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver a Órdenes
        </Button>
        <h1 className="text-3xl font-bold">Editar Orden de Trabajo</h1>
        <p className="text-muted-foreground">Modifica los datos de la orden</p>
      </div>

      <div className="bg-card rounded-lg border p-6">
        <OrdenForm orden={orden} onSuccess={handleSuccess} onCancel={handleCancel} />
      </div>
    </div>
  )
}

