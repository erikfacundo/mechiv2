"use client"

import { useRouter } from "next/navigation"
import { GastoForm } from "@/components/forms/gasto-form"
import { FormPageLayout } from "@/components/ui/form-page-layout"
import { useToast } from "@/hooks/use-toast"

export default function NuevoGastoPage() {
  const router = useRouter()
  const { toast } = useToast()

  const handleSuccess = () => {
    toast({
      title: "Gasto creado",
      description: "El gasto se ha creado exitosamente.",
    })
    router.push("/gastos")
  }

  const handleCancel = () => {
    router.push("/gastos")
  }

  return (
    <FormPageLayout
      title="Nuevo Gasto"
      description="Completa los datos del nuevo gasto"
      backUrl="/gastos"
    >
      <GastoForm onSuccess={handleSuccess} onCancel={handleCancel} />
    </FormPageLayout>
  )
}

