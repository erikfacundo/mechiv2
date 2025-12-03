"use client"

import { useRouter, useParams } from "next/navigation"
import { VehiculoForm } from "@/components/forms/vehiculo-form"
import { FormPageLayout } from "@/components/ui/form-page-layout"
import { Button } from "@/components/ui/button"
import { useVehiculo } from "@/hooks/use-vehiculos"
import { useToast } from "@/hooks/use-toast"

export default function EditarVehiculoPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string
  const { vehiculo, loading } = useVehiculo(id)
  const { toast } = useToast()

  const handleSuccess = () => {
    toast({
      title: "Vehículo actualizado",
      description: "El vehículo se ha actualizado exitosamente.",
    })
    router.push("/vehiculos")
  }

  const handleCancel = () => {
    router.push("/vehiculos")
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-gray-500 dark:text-gray-400">Cargando vehículo...</p>
        </div>
      </div>
    )
  }

  if (!vehiculo) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-gray-500 dark:text-gray-400 mb-4">Vehículo no encontrado</p>
          <Button onClick={() => router.push("/vehiculos")}>
            Volver a Vehículos
          </Button>
        </div>
      </div>
    )
  }

  return (
    <FormPageLayout
      title="Editar Vehículo"
      description="Modifica los datos del vehículo"
      backUrl="/vehiculos"
    >
      <VehiculoForm vehiculo={vehiculo} onSuccess={handleSuccess} onCancel={handleCancel} />
    </FormPageLayout>
  )
}

