"use client"

import { useRouter, useParams } from "next/navigation"
import { OrdenForm } from "@/components/forms/orden-form"
import { FormPageLayout } from "@/components/ui/form-page-layout"
import { Button } from "@/components/ui/button"
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
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-gray-500 dark:text-gray-400">Cargando orden...</p>
        </div>
      </div>
    )
  }

  if (!orden) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-gray-500 dark:text-gray-400 mb-4">Orden no encontrada</p>
          <Button onClick={() => router.push("/ordenes")}>
            Volver a Órdenes
          </Button>
        </div>
      </div>
    )
  }

  return (
    <FormPageLayout
      title="Editar Orden de Trabajo"
      description="Modifica los datos de la orden"
      backUrl="/ordenes"
      className="max-w-6xl"
    >
      <OrdenForm orden={orden} onSuccess={handleSuccess} onCancel={handleCancel} />
    </FormPageLayout>
  )
}

