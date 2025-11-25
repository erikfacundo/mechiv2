"use client"

import { useRouter, useParams } from "next/navigation"
import { VehiculoForm } from "@/components/forms/vehiculo-form"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
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
      <div className="container mx-auto py-4 sm:py-8 max-w-4xl">
        <div className="text-center py-8">Cargando vehículo...</div>
      </div>
    )
  }

  if (!vehiculo) {
    return (
      <div className="container mx-auto py-4 sm:py-8 max-w-4xl">
        <div className="text-center py-8">
          <p className="text-muted-foreground mb-4">Vehículo no encontrado</p>
          <Button onClick={() => router.push("/vehiculos")}>
            Volver a Vehículos
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
          onClick={() => router.push("/vehiculos")}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver a Vehículos
        </Button>
        <h1 className="text-2xl sm:text-3xl font-bold">Editar Vehículo</h1>
        <p className="text-sm sm:text-base text-muted-foreground">Modifica los datos del vehículo</p>
      </div>

      <div className="bg-card rounded-lg border p-4 sm:p-6">
        <VehiculoForm vehiculo={vehiculo} onSuccess={handleSuccess} onCancel={handleCancel} />
      </div>
    </div>
  )
}

