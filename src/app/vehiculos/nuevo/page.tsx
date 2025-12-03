"use client"

import { useRouter } from "next/navigation"
import { VehiculoForm } from "@/components/forms/vehiculo-form"
import { FormPageLayout } from "@/components/ui/form-page-layout"
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
    <FormPageLayout
      title="Nuevo Vehículo"
      description="Completa los datos del nuevo vehículo"
      backUrl="/vehiculos"
    >
      <VehiculoForm onSuccess={handleSuccess} onCancel={handleCancel} />
    </FormPageLayout>
  )
}

