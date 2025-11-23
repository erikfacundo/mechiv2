"use client"

import { useRouter } from "next/navigation"
import { VehiculoForm } from "@/components/forms/vehiculo-form"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function NuevoVehiculoPage() {
  const router = useRouter()
  const { toast } = useToast()

  const handleSuccess = () => {
    toast({
      title: "Vehículo creado",
      description: "El vehículo se ha creado exitosamente.",
    })
    router.push("/vehiculos")
  }

  const handleCancel = () => {
    router.push("/vehiculos")
  }

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => router.push("/vehiculos")}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver a Vehículos
        </Button>
        <h1 className="text-3xl font-bold">Nuevo Vehículo</h1>
        <p className="text-muted-foreground">Completa los datos del nuevo vehículo</p>
      </div>

      <div className="bg-card rounded-lg border p-6">
        <VehiculoForm onSuccess={handleSuccess} onCancel={handleCancel} />
      </div>
    </div>
  )
}

