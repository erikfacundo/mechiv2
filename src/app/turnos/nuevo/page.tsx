"use client"

import { useRouter } from "next/navigation"
import { TurnoForm } from "@/components/forms/turno-form"
import { FormPageLayout } from "@/components/ui/form-page-layout"
import { useToast } from "@/hooks/use-toast"

export default function NuevoTurnoPage() {
  const router = useRouter()
  const { toast } = useToast()

  const handleSuccess = () => {
    toast({
      title: "Turno creado",
      description: "El turno se ha creado exitosamente.",
    })
    router.push("/turnos")
  }

  const handleCancel = () => {
    router.push("/turnos")
  }

  return (
    <FormPageLayout
      title="Nuevo Turno"
      description="Completa los datos del nuevo turno"
      backUrl="/turnos"
    >
      <TurnoForm onSuccess={handleSuccess} onCancel={handleCancel} />
    </FormPageLayout>
  )
}

